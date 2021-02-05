import moment from "moment";

export function yesterday(): Date {
  return moment().subtract(1, "days").toDate();
}

export function daysAgo(days: number): Date {
  return moment().subtract(days, "days").toDate();
}
