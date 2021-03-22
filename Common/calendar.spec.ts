import { Calendar, DynamoDbCalendar } from "./calendar";
import moment from "moment";

describe("Calendar", () => {
  let calendar: Calendar;
  beforeEach(() => {
    calendar = new Calendar();
  });
  it("should compute yesterday as date", () => {
    const today = moment().startOf("minute").toDate();
    const _today = calendar.today();
    expect(_today).toEqual(today);
  });
  it("should compute preceding hour as date", () => {
    const hours = 1;
    const now = new Date();
    const earlierToday = calendar.hoursAgo(hours);
    expect(earlierToday.getHours()).toBe(now.getHours() - hours);
  });
  it("should compute preceding day as date", () => {
    const days = 1;
    const now = new Date();
    const tsEarlierToday = calendar.daysAgo(days);
    expect(tsEarlierToday.getDate()).toBe(now.getDate() - days);
  });
});

describe("DynamoDbCalendar", () => {
  let calendar: DynamoDbCalendar;
  beforeEach(() => {
    calendar = new DynamoDbCalendar();
  });
  it("should compute yesterday as timestamp", () => {
    const tsToday = moment().startOf("minute").toDate().getTime().toString();
    const _tsToday = calendar.today();
    expect(_tsToday).toBe(tsToday);
  });
  it("should compute preceding hour as timestamp", () => {
    const hours = 1;
    const now = new Date();
    const tsEarlierToday = calendar.hoursAgo(hours);
    expect((new Date(Number(tsEarlierToday))).getHours()).toBe(now.getHours() - hours);
  });
  it("should compute preceding day as timestamp", () => {
    const days = 1;
    const now = new Date();
    const tsEarlierToday = calendar.daysAgo(days);
    expect((new Date(Number(tsEarlierToday))).getDate()).toBe(now.getDate() - days);
  });
});
