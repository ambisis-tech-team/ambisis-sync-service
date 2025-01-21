import { beforeAll } from "vitest";
import { SyncContext } from "./sync_context";
import { Time } from "../../../../../shared/types/time";

beforeAll(async () => {
  await SyncContext.build();

  await SyncContext.db.query(
    "CREATE TABLE IF NOT EXISTS person (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), modificacaoData DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    SyncContext.database
  );
  await SyncContext.db.query(
    "CREATE TABLE IF NOT EXISTS address (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), modificacaoData DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, personId INT NOT NULL, CONSTRAINT FOREIGN KEY (personId) REFERENCES person(id) ON DELETE CASCADE)",
    SyncContext.database
  );
  await SyncContext.db.query(
    "CREATE TABLE IF NOT EXISTS parent (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), modificacaoData DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    SyncContext.database
  );
  await SyncContext.db.query(
    "CREATE TABLE IF NOT EXISTS children (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), modificacaoData DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, parentId INT NOT NULL, CONSTRAINT FOREIGN KEY (parentId) REFERENCES parent(id) ON DELETE CASCADE)",
    SyncContext.database
  );
  await SyncContext.db.query(
    "CREATE TABLE IF NOT EXISTS board (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), modificacaoData DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    SyncContext.database
  );
  await SyncContext.db.query(
    "CREATE TABLE IF NOT EXISTS message (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), modificacaoData DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    SyncContext.database
  );
  await SyncContext.db.query(
    "CREATE TABLE IF NOT EXISTS message_in_board (id INT AUTO_INCREMENT PRIMARY KEY, modificacaoData DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, boardId INT NOT NULL, messageId INT NOT NULL, CONSTRAINT FOREIGN KEY (boardId) REFERENCES board(id) ON DELETE CASCADE, CONSTRAINT FOREIGN KEY (messageId) REFERENCES message(id) ON DELETE CASCADE)",
    SyncContext.database
  );
  await SyncContext.db.query(
    "CREATE TABLE IF NOT EXISTS exclusao_log (id INT AUTO_INCREMENT PRIMARY KEY, dataExclusao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, tabelaExclusao VARCHAR(255) NOT NULL, itemId INT NOT NULL)",
    SyncContext.database
  );

  return async () => {
    await SyncContext.destroy();
  };
}, Time.MINUTE * 5);
