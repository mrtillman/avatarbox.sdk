import * as mysql from 'mysql';

export namespace MySqlService {

  class MySqlServiceBase {
    protected _connection: any;
    constructor() {
      this._connection = mysql.createConnection({
        host     : process.env.MYSQL_HOST,
        port     : Number(process.env.MYSQL_PORT),
        user     : process.env.MYSQL_USER,
        password : process.env.MYSQL_PASSWORD,
        database : process.env.MYSQL_DATABASE
      });
    }
    protected async execute(sql: string): Promise<any> {
      return new Promise((resolve, reject) => {
        this._connection.query(sql, function (error: any, results: any[], fields: any) {
          if (error) reject(error);
          resolve(results);
        });
      })
    }
  }

  export class Gravatar extends MySqlServiceBase {
    constructor() {
      super();
    }
    async save(username: string, passphrase: string): Promise<void> {
      this.execute(`INSERT INTO users (username, passphrase)
                    VALUES ('${username}', '${passphrase}')`);
    }
    async update(username: string, passphrase: string): Promise<void> {
      this.execute(`UPDATE users
                    SET passphrase = '${passphrase}'
                    WHERE username = '${username}'`);
    }
    end(){
      this._connection.end();
    }
  }
}