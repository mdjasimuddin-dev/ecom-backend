import app from './app';
import config from './app/config';
import { prisma } from './app/lib/prisma';
import { redisClient } from './app/lib/redis';
import { SeedSuperAdmin, seedTesterAdmin, seedTesterStaff } from './app/utils/seed';

const PORT = config.port;

const main = async () => {
  try {
    await prisma.$connect();
    console.log('Connected prisma database successfully');

    await redisClient.connect();
    console.log('Redis Connected successfully.');

    SeedSuperAdmin();
    seedTesterAdmin();
    seedTesterStaff();

    app.listen(PORT, () => {
      console.log(`Server is running on port is : ${PORT}`);
    });
  } catch (error) {
    console.log(`Error starting the server : ${error}`);
    await prisma.$disconnect();
    process.exit(1);
  }
};

main();
