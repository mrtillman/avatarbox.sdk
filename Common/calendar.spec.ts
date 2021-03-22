import { Calendar, DynamoDbCalendar } from "./calendar";
import moment from "moment";

describe("Calendar", () => {
  let calendar: Calendar;
  beforeEach(() => {
    calendar = new Calendar();
  });
  it("should get yesterday as date", () => {
    const today = moment().startOf("minute").toDate();
    const _today = calendar.today();
    expect(_today).toEqual(today);
  });
});

describe("DynamoDbCalendar", () => {
  let calendar: DynamoDbCalendar;
  beforeEach(() => {
    calendar = new DynamoDbCalendar();
  });
  it("should get yesterday as timestamp", () => {
    const tsToday = moment().startOf("minute").toDate().getTime().toString();
    const _tsToday = calendar.today();
    expect(_tsToday).toBe(tsToday);
  });
});
