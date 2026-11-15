import app from './app';
import config from './app/config';
import { prisma } from './app/lib/prisma';

const PORT = config.port;

const main = async () => {
  try {
    await prisma.$connect();
    console.log('Connected prisma database successfully');
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
