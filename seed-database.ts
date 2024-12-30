import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { MongoClient } from 'mongodb';
import { date, z } from 'zod';
import 'dotenv/config';


const client = new MongoClient(process.env.MONGODB_ATLAS_URI as string);

const lim = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
});
const EmployeeSchema = z.object({
    employee_id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    date_of_birth: date(),
    address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        postal_code: z.string(),
        country: z.string(),
    }),
    contact_details: z.object({
        email: z.string().email(),
        phone_number: z.string(),
    }),
    job_details: z.object({
        job_title: z.string(),
        department: z.string(),
        manager: z.string(),
        hire_date: date(),
        salary: z.number(),
        currency: z.string(),
    }),
    work_location: z.object({
        nearest_office: z.string(),
        is_remote: z.boolean(),
    }),
    reporting_manager: z.string().nullable(),
    skills: z.array(z.string()),
    performance_review: z.array(
        z.object({
            review_date: date(),
            rating: z.number(),
            comments: z.string(),
        })
    ),
    benefits: z.object({
        health_insurance: z.string(),
        retirement_plan: z.string(),
        paid_time_off: z.string(),
    }),
    emergency_contact: z.object({
        name: z.string(),
        relationship: z.string(),
        phone_number: z.string(),
    }),
    notes: z.string(),
});

type Employee = z.infer<typeof EmployeeSchema>;

const parser = StructuredOutputParser.fromZodSchema(z.array(EmployeeSchema));

async function generateSyntheticEmployeeRecord(): Promise<Employee[]> {
    const prompt = `You are a helpful assistant that generates synthetic employee data. Generate a synthetic employee record with the following details: Each employee record should have the following fields: employee_id, first_name, last_name, date_of_birth, address, contact_details, job_details, work_location, reporting_manager, skills, performance_review, benefits, emergency_contact, notes. The employee_id should be a unique string. The first_name and last_name should be random names. The date_of_birth should be a random date between 1950 and 2000. The address should be a random address. The contact_details should be a random email and phone number. The job_details should be a random job title, department, manager, hire_date, salary, and currency. The work_location should be a random nearest_office and is_remote. The reporting_manager should be a random name. The skills should be random skills. The performance_review should be a random review_date, rating, and comments. The benefits should be a random health_insurance, retirement_plan, and paid_time_off. The emergency_contact should be a random name, relationship, and phone_number. The notes should be a random note. Ensure variety in the data and that it is realistic.

    ${parser.getFormatInstructions()}`;

    console.log('Generating synthetic employee record...');
    const response = await lim.invoke(prompt);
    return parser.parse(response.content as string);
}

async function createEmployeeSummary(employee: Employee): Promise<string> {
    return new Promise((resolve) => {
        const jobDetails = `${employee.job_details.job_title} in the ${employee.job_details.department} department. The hire date is ${employee.job_details.hire_date.toISOString()}. The salary is ${employee.job_details.salary} ${employee.job_details.currency}.`;
        const skills = employee.skills.join(', ');
        const performanceReview: string = employee.performance_review
            .map((review: { review_date: Date; rating: number; comments: string }) =>
                `Review date: ${review.review_date.toISOString()}\nRating: ${review.rating}\nComments: ${review.comments}`
            )
            .join('\n\n');
        const basicInfo = `Employee ID: ${employee.employee_id}\nName: ${employee.first_name} ${employee.last_name}\nDate of birth: ${employee.date_of_birth.toISOString()}\nAddress: ${employee.address.street}, ${employee.address.city}, ${employee.address.state}, ${employee.address.postal_code}, ${employee.address.country}\nEmail: ${employee.contact_details.email}\nPhone number: ${employee.contact_details.phone_number}`;
        const workLocation = `Nearest office: ${employee.work_location.nearest_office}\nRemote: ${employee.work_location.is_remote}`;
        const benefits = `Health insurance: ${employee.benefits.health_insurance}\nRetirement plan: ${employee.benefits.retirement_plan}\nPaid time off: ${employee.benefits.paid_time_off}`;
        const emergencyContact = `Name: ${employee.emergency_contact.name}\nRelationship: ${employee.emergency_contact.relationship}\nPhone number: ${employee.emergency_contact.phone_number}`;
        const notes = employee.notes;
        const summary = `${basicInfo}\n\n${jobDetails}\n\nSkills: ${skills}\n\nPerformance review:\n${performanceReview}\n\nWork location:\n${workLocation}\n\nBenefits:\n${benefits}\n\nEmergency contact:\n${emergencyContact}\n\nNotes:\n${notes}`;
        resolve(summary);
    });
}
async function seedDatabase(): Promise<void> {
    try {
        await client.connect();
        await client.db('Admin').command({ ping: 1 });
        console.log('Pinged your deployment. you are good to go');

        const db = client.db('hr_database');
        const collection = db.collection('employees');
        //await collection.deleteMany({});
        //console.log('Deleted all documents in the employees collection.');

        const syntheticData = await generateSyntheticEmployeeRecord();

        const recordWithSummaries = await Promise.all(
            syntheticData.map(async (record: Employee) => ({
                pageContent: await createEmployeeSummary(record),
                metadata: { ...record }
            }))
        );

        for (const record of recordWithSummaries) {
            await MongoDBAtlasVectorSearch.fromDocuments(
                [record],
                new OpenAIEmbeddings(),

                {
                    collection,
                    indexName: 'vector_index',
                    textKey: 'embedding_text',
                    embeddingKey: 'embedding',

                }

            );

            console.log(`Indexed record with employee_id: ${record.metadata.employee_id}`);

        }
        console.log('Successfully seeded the database with synthetic employee data.');
    } catch (error) {
        console.error('Error seeding the database:', error);
    } finally {
        await client.close();
    }
}

seedDatabase().catch(console.error);


