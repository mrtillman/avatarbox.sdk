import moment from "moment";

export class Calendar {
  yesterday(): Date {
    return this.daysAgo(1);
  }
  hoursAgo(hours: number): Date {
    return moment().subtract(hours, "hours").toDate();
  }
  daysAgo(days: number): Date {
    return moment().subtract(days, "days").toDate();
  }
  daysAhead(days: number): Date {
    return moment().add(days, "days").toDate();
  }
  today(): Date {
    return moment().startOf("minute").toDate();
  }
  now(): Date {
    return moment().toDate();
  }
}

export class UnixCalendar {
  private _calendar: Calendar;

  constructor() {
    this._calendar = new Calendar();
  }
  daysAhead(days: number = 10): string {
    return Math.floor(
      this._calendar.daysAhead(days).getTime() / 1000
    ).toString();
  }
  yesterday(): string {
    return this._calendar.yesterday().getTime().toString();
  }
  daysAgo(days: number): string {
    return this._calendar.daysAgo(days).getTime().toString();
  }
  hoursAgo(hours: number): string {
    return this._calendar.hoursAgo(hours).getTime().toString();
  }
  today(): string {
    return this._calendar.today().getTime().toString();
  }
  now(): string {
    return this._calendar.now().getTime().toString();
  }
}
