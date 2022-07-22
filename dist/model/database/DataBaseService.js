"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
class DatabaseService {
    constructor(databasProvider) {
        this.databasProvider = databasProvider;
    }
    async disconnect() {
        return await this.databasProvider.disconnect();
    }
    async insert(preparedInsert) {
        return await this.databasProvider.insert(preparedInsert);
    }
    async select(query) {
        return await this.databasProvider.select(query);
    }
    async update(preparedUpdate) {
        return await this.databasProvider.update(preparedUpdate);
    }
    async delete(query) {
        return await this.databasProvider.delete(query);
    }
}
exports.DatabaseService = DatabaseService;
