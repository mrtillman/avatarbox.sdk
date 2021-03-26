import { Calendar, DynamoDbCalendar } from "./calendar";
import moment from "moment";

describe("Calendar", () => {
  let calendar: Calendar;
  beforeEach(() => {
    calendar = new Calendar();
  });
  it("should compute now as date", () => {
    const now = new Date();
    const _now = calendar.now();
    expect(
      now.toDateString() == _now.toDateString() &&
        now.getSeconds() == _now.getSeconds()
    ).toBe(true);
  });
  it("should compute yesterday as date", () => {
    const yesterday = moment().subtract(1, "days").toDate().toDateString();
    const _yesterday = calendar.yesterday().toDateString();
    expect(_yesterday).toEqual(yesterday);
  });
  it("should compute today as date", () => {
    const today = moment().startOf("minute").toDate();
    const _today = calendar.today();
    expect(_today).toEqual(today);
  });
  it("should compute preceding hour as date", () => {
    const hours = 1;
    const earlier = calendar.hoursAgo(hours);
    expect(earlier.getHours()).toBe(
      moment().subtract(hours, "hours").toDate().getHours()
    );
  });
  it("should compute preceding day as date", () => {
    const days = 1;
    const now = new Date();
    const earlier = calendar.daysAgo(days);
    expect(earlier.getDate()).toEqual(now.getDate() - days);
  });
});

describe("DynamoDbCalendar", () => {
  let calendar: DynamoDbCalendar;
  beforeEach(() => {
    calendar = new DynamoDbCalendar();
  });
  it("should compute now as timestamp", () => {
    const now = new Date();
    const _now = calendar.now();
    expect(
      now.toDateString() == new Date(Number(_now)).toDateString() &&
        now.getSeconds() == new Date(Number(_now)).getSeconds()
    ).toBe(true);
  });
  it("should compute yesterday as timestamp", () => {
    const tsYesterday = moment().subtract(1, "days").toDate().getTime();
    const _tsYesterday = calendar.yesterday();
    expect(new Date(Number(_tsYesterday)).toDateString()).toBe(
      new Date(Number(tsYesterday)).toDateString()
    );
  });
  it("should compute today as timestamp", () => {
    const tsToday = moment().startOf("minute").toDate().getTime().toString();
    const _tsToday = calendar.today();
    expect(_tsToday).toBe(tsToday);
  });
  it("should compute preceding hour as timestamp", () => {
    const hours = 1;
    const tsEarlier = calendar.hoursAgo(hours);
    expect(new Date(Number(tsEarlier)).getHours()).toBe(
      moment().subtract(hours, "hours").toDate().getHours()
    );
  });
  it("should compute preceding day as timestamp", () => {
    const days = 1;
    const now = new Date();
    const tsEarlier = calendar.daysAgo(days);
    expect(new Date(Number(tsEarlier)).getDate()).toBe(now.getDate() - days);
  });
});
