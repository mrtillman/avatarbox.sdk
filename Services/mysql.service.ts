import * as mysql from 'mysql';
import { GravatarUser } from '../Domain/gravatar-user';

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
    async save(user: GravatarUser): Promise<void> {
      this.execute(`INSERT INTO users (id, hash, secret)
                    VALUES (${user.id}, '${user.emailHash}', '${user.password}')`);
    }
    async update(user: GravatarUser): Promise<void> {
      this.execute(`UPDATE users
                    SET secret = '${user.password}'
                    WHERE id = ${user.id}`);
    }
    async delete(...ids: string[]){
      this.execute(`DELETE FROM users
                    WHERE id IN (${ids.join(',')})`);
    }
    end(){
      this._connection.end();
    }
  }
}