import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/iam';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.IAM_DATABASE_URL;

if (!connectionString) {
    throw new Error('IAM_DATABASE_URL is required');
}

const adapter = new PrismaPg({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const fullName = process.env.ADMIN_NAME || 'System Admin';

    if (!email) {
        throw new Error('ADMIN_EMAIL is required');
    }

    if (!password) {
        throw new Error('ADMIN_PASSWORD is required');
    }

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        console.log(`Admin user already exists: ${email}`);
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            fullName,
            role: 'ADMIN',
            isEmailVerified: true,
        },
    });

    console.log(`Admin user created: ${email}`);
}

main()
    .catch((error) => {
        console.error('Seed admin failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });