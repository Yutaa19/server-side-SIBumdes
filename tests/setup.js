import { beforeAll, afterAll, afterEach } from "bun:test";
const db = require('../src/store/sequelize');
const app = require('../src/app');

beforeAll(async () => {
    // Sinkronisasi database in-memory
    await db.sequelize.sync({ force: true });
});

afterEach(async () => {
    // Kosongkan semua data setelah setiap test agar bersih
    await db.kantor_pusat.destroy({ where: {} });
    await db.resik.destroy({ where: {} });
    await db.internet.destroy({ where: {} });
    await db.user.destroy({ where: {} });
});

export { app, db };
