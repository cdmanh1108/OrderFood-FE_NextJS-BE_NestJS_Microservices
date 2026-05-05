import { PrismaClient as IamPrismaClient } from '../generated/iam';
import { PrismaClient as CatalogPrismaClient } from '../generated/catalog';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

function toSlug(str: string) {
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function createIamClient() {
  const connectionString = process.env.IAM_DATABASE_URL;
  if (!connectionString) throw new Error('IAM_DATABASE_URL is not defined');
  const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  const pool = new Pool({ 
    connectionString, 
    ssl: isLocal ? false : { rejectUnauthorized: false } 
  });
  const client = new IamPrismaClient({ adapter: new PrismaPg(pool) });
  return { client, pool };
}

async function createCatalogClient() {
  const connectionString = process.env.CATALOG_DATABASE_URL;
  if (!connectionString) throw new Error('CATALOG_DATABASE_URL is not defined');
  const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  const pool = new Pool({ 
    connectionString, 
    ssl: isLocal ? false : { rejectUnauthorized: false } 
  });
  const client = new CatalogPrismaClient({ adapter: new PrismaPg(pool) });
  return { client, pool };
}

async function main() {
  console.log('Bắt đầu chạy seed data...');
  
  const iam = await createIamClient();
  const catalog = await createCatalogClient();

  try {
    // ----------------------------------------------------
    // 1. SEED SYSTEM ADMIN
    // ----------------------------------------------------
    console.log('--- Seeding System Admin ---');
    const adminEmail = 'admin@example.com';
    const hashedPassword = await bcrypt.hash('12345678', 10);
    
    await iam.client.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        password: hashedPassword,
        fullName: 'System Admin',
        role: 'ADMIN',
        isEmailVerified: true,
      },
    });
    console.log('✅ Admin user created (admin@example.com / 12345678)');

    // ----------------------------------------------------
    // 2. SEED CATEGORIES & MENU ITEMS
    // ----------------------------------------------------
    console.log('--- Seeding Categories and Menu Items ---');

    const categories = [
      { id: 'e8dc7a05-2399-4852-8f31-90dd9fb81f15', name: 'Bún đậu mắm tôm', slug: 'bun-dau-mam-tom' },
      { id: '2d0e5860-d8fd-490e-892a-05b5e2025d6b', name: 'Gọi thêm', slug: 'goi-them' },
      { id: '00feb803-22d1-4a01-91d2-79c5f18e023c', name: 'Đồ uống', slug: 'do-uong' }
    ];

    for (const cat of categories) {
      await catalog.client.category.upsert({
        where: { id: cat.id },
        update: { name: cat.name, slug: cat.slug },
        create: { id: cat.id, name: cat.name, slug: cat.slug },
      });
    }
    console.log('✅ Categories created');

    const menuItems = [
      // Danh mục Bún đậu mắm tôm
      { id: 'f4a0725e-c5f3-4a9d-97a7-e197436ee423', name: 'Bún đậu đầy đủ', description: 'Bún, đậu, thịt, chả cốm, dồi sụn, nem rán', image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/9a043c42-2999-4dcb-bae1-75445f3dc60c.jpg', price: 50000, categoryId: 'e8dc7a05-2399-4852-8f31-90dd9fb81f15' },
      { id: 'b8da8c0f-b65b-4b42-955b-af045f9abcb3', name: 'Bún đậu thường', description: 'Bún, đậu', image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/07640831-2e6d-484d-b17a-988f48bf0f6d.jpg', price: 25000, categoryId: 'e8dc7a05-2399-4852-8f31-90dd9fb81f15' },
      { id: '208267d9-c118-4d41-98ff-799da6093b75', name: 'Bún đậu thịt bắp giò', description: 'Bún, đậu, thịt', image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/67347791-5195-48c6-8c07-759596ecb685.jpg', price: 40000, categoryId: 'e8dc7a05-2399-4852-8f31-90dd9fb81f15' },
      { id: 'd95f8df8-0d03-4641-9959-682f13d6c2da', name: 'Bún đậu dồi rán', description: 'Bún, đậu, dồi sụn rán', image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/1ec5c29a-ff8c-43ce-9690-b34a13a10fb9.jpg', price: 40000, categoryId: 'e8dc7a05-2399-4852-8f31-90dd9fb81f15' },
      { id: '9c034f2b-5562-4eb6-952b-fd485ea4e49c', name: 'Bún đậu chả cốm', description: null, image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/916e9dfc-2cd6-4acf-ae2c-45a2b6bf4850.jpg', price: 40000, categoryId: 'e8dc7a05-2399-4852-8f31-90dd9fb81f15' },
      // Danh mục Gọi thêm
      { id: '5f5715c1-46ae-4401-8cef-d934d209b27e', name: 'Bún thêm', description: null, image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/0ddcf75a-645a-41f2-ab95-844d89a0fff4.png', price: 6000, categoryId: '2d0e5860-d8fd-490e-892a-05b5e2025d6b' },
      { id: 'b1e9b0bf-a464-4a06-a1f6-f82cd9b1c484', name: 'Bánh tráng', description: null, image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/374366d0-4aad-4488-add1-09e1b9217b94.webp', price: 5000, categoryId: '2d0e5860-d8fd-490e-892a-05b5e2025d6b' },
      { id: 'd20de573-e1fb-47a8-a4db-2647d513d859', name: 'Đậu thêm', description: null, image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/65816a3d-c6a3-4b37-ba03-b8a801f43e52.webp', price: 15000, categoryId: '2d0e5860-d8fd-490e-892a-05b5e2025d6b' },
      { id: 'a5a2e470-78dd-41c7-b3ae-563965ea3de0', name: 'Thịt bắp giò', description: null, image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/f5a794b0-0d36-4162-bc9f-19d961a639d0.jpg', price: 20000, categoryId: '2d0e5860-d8fd-490e-892a-05b5e2025d6b' },
      { id: '434d9c2e-85f3-456b-8110-4ca5ac50f8dc', name: 'Dồi sụn rán', description: null, image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/74e80468-de37-4b21-9a37-99532839a89c.jpg', price: 20000, categoryId: '2d0e5860-d8fd-490e-892a-05b5e2025d6b' },
      { id: '79e64406-d990-46c7-9865-84946fae9883', name: 'Chả cốm', description: '2 miếng', image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/4f34f542-1893-43ab-b66e-cdb0a5e382f8.jpeg', price: 20000, categoryId: '2d0e5860-d8fd-490e-892a-05b5e2025d6b' },
      { id: 'cc0a2485-ef34-4de0-8c1d-772eb62063ee', name: 'Chả ốc', description: '2 miếng', image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/7147edea-58a5-430b-a5de-a2f1a6810d5a.jpeg', price: 0, categoryId: '2d0e5860-d8fd-490e-892a-05b5e2025d6b' },
      { id: '7bd80828-26a5-4329-9e57-d8c64b01d0af', name: 'Nem chua rán Hà Nội', description: null, image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/3a149a57-3613-4dc2-9bf6-056f93e847a6.jpg', price: 30000, categoryId: '2d0e5860-d8fd-490e-892a-05b5e2025d6b' },
      // Danh mục Đồ uống
      { id: '89f4f45b-8be9-4706-a4c2-9bc806206ed0', name: 'Trà tắc', description: null, image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/c2a0ec92-d49f-483c-bd3a-9317f9ea603c.jpg', price: 15000, categoryId: '00feb803-22d1-4a01-91d2-79c5f18e023c' },
      { id: '85df7b0a-4660-479f-9b5c-2b4bc3cf121c', name: 'Trà dâu tằm Đà Lạt', description: null, image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/5c8c8b40-4b38-45ae-bbe2-a895370f43ff.jpg', price: 20000, categoryId: '00feb803-22d1-4a01-91d2-79c5f18e023c' },
      { id: 'b083cb20-1495-4094-bdcd-9f73c13bb8da', name: 'Sữa đậu nành', description: null, image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/f8c7d5cd-bed2-4f79-96ea-782000291712.jpg', price: 8000, categoryId: '00feb803-22d1-4a01-91d2-79c5f18e023c' },
      { id: 'bf9ec15f-c1a4-4835-96f9-44b99859e194', name: 'Coca', description: null, image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/0a225e05-7542-4280-9e2c-c14ee30cc1c0.webp', price: 15000, categoryId: '00feb803-22d1-4a01-91d2-79c5f18e023c' },
      { id: '49d47fd6-cd9c-49a9-a4bb-5aa2fe74fff2', name: 'Sting', description: null, image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/18504588-b9f3-4589-afc0-5ea23501c44b.webp', price: 15000, categoryId: '00feb803-22d1-4a01-91d2-79c5f18e023c' },
      { id: 'e95ad551-d78c-4ba4-9de2-636f808d5005', name: 'Nước suối', description: null, image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/c976aebc-b6a6-4456-ac41-8b944bd1a188.jpg', price: 10000, categoryId: '00feb803-22d1-4a01-91d2-79c5f18e023c' },
      { id: 'a574a33f-af1f-44f5-b28b-2e97d55bf022', name: 'Trà đá', description: null, image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/4381e1b1-a41e-488f-8432-f48a88c030b7.png', price: 3000, categoryId: '00feb803-22d1-4a01-91d2-79c5f18e023c' },
      { id: '74e04f24-a5b2-4901-b02a-d48210712f4c', name: 'Bia', description: null, image: 'https://d3j0s5326wg516.cloudfront.net/menu-items/2026/05/9fe66aa9-eeee-4a7e-b7f1-4011023321cf.jpg', price: 20000, categoryId: '00feb803-22d1-4a01-91d2-79c5f18e023c' }
    ];

    for (const item of menuItems) {
      const slug = toSlug(item.name);
      await catalog.client.menuItem.upsert({
        where: { id: item.id },
        update: {
          name: item.name,
          slug: slug,
          description: item.description,
          image: item.image,
          price: item.price,
          categoryId: item.categoryId
        },
        create: {
          id: item.id,
          name: item.name,
          slug: slug,
          description: item.description,
          image: item.image,
          price: item.price,
          categoryId: item.categoryId
        },
      });
    }
    console.log('✅ Menu items created');

    console.log('--- Hoàn tất quá trình seed data ---');
  } catch (error) {
    console.error('Lỗi trong quá trình seed data:', error);
  } finally {
    await iam.client.$disconnect();
    await iam.pool.end();
    
    await catalog.client.$disconnect();
    await catalog.pool.end();
  }
}

main();
