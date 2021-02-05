import moment from "moment";

export function yesterday(): Date {
  return moment().subtract(1, "days").toDate();
}
