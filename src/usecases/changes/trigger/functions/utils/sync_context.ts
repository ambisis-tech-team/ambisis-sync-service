import { MySqlContainer, StartedMySqlContainer } from "@testcontainers/mysql";
import { DataAccessObject } from "mysql-all-in-one";
import type { MappedForeignKeys } from "../push_changes/functions/map_foreign_keys/types/mapped_foreign_keys";

export class SyncContext {
  private static instance: SyncContext;
  private static containerInstance: MySqlContainer;

  private constructor(
    private readonly db: DataAccessObject,
    private readonly container: MySqlContainer,
    private readonly database: string,
    private readonly mysql: StartedMySqlContainer
  ) {}

  public static async build() {
    if (SyncContext.instance) {
      return SyncContext.instance;
    }

    if (!SyncContext.containerInstance) {
      SyncContext.containerInstance = new MySqlContainer().withReuse();
    }
    const mysql = await SyncContext.containerInstance.start();
    const database = mysql.getDatabase();

    const db = new DataAccessObject({
      host: mysql.getHost(),
      port: mysql.getMappedPort(3306),
      user: mysql.getUsername(),
      password: mysql.getUserPassword(),
      timezone: "Z",
    });

    SyncContext.instance = new SyncContext(
      db,
      SyncContext.containerInstance,
      database,
      mysql
    );

    return SyncContext.instance;
  }

  static get db() {
    return SyncContext.instance.db;
  }

  static get container() {
    return SyncContext.instance.container;
  }

  static get database() {
    return SyncContext.instance.database;
  }

  static get mysql() {
    return SyncContext.instance.mysql;
  }

  public static async destroy() {
    await SyncContext.instance.db.dispose();
    await SyncContext.instance.mysql.stop();
  }
}

const TABLES = [
  "person",
  "address",
  "parent",
  "children",
  "board",
  "message_in_board",
  "message",
];

const MAPPED_FOREIGN_KEYS: MappedForeignKeys = {
  address: [
    {
      referencedColumn: "id",
      referencedTable: "person",
      parentColumn: "personId",
    },
  ],
  children: [
    {
      referencedColumn: "id",
      referencedTable: "parent",
      parentColumn: "parentId",
    },
  ],
  message_in_board: [
    {
      referencedColumn: "id",
      referencedTable: "board",
      parentColumn: "boardId",
    },
    {
      referencedColumn: "id",
      referencedTable: "message",
      parentColumn: "messageId",
    },
  ],
};

export { TABLES, MAPPED_FOREIGN_KEYS };
