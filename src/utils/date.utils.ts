import { Period, DateRange } from '../types/date.types.js';

export function getPeriodDates(period: Period): DateRange {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const getMonthStart = (year: number, month: number) => {
    return new Date(year, month, 1);
  };

  const getMonthEnd = (year: number, month: number) => {
    return new Date(year, month + 1, 0, 23, 59, 59, 999);
  };

  const getQuarterInfo = (date: Date) => {
    const month = date.getMonth();
    const quarter = Math.floor(month / 3);
    return {
      startMonth: quarter * 3,
      endMonth: quarter * 3 + 2
    };
  };

  switch (period) {
    case 'this-month': {
      return {
        startDate: getMonthStart(currentYear, currentMonth),
        endDate: getMonthEnd(currentYear, currentMonth)
      };
    }

    case 'last-month': {
      const lastMonth = currentMonth - 1;
      const year = lastMonth < 0 ? currentYear - 1 : currentYear;
      const month = lastMonth < 0 ? 11 : lastMonth;
      return {
        startDate: getMonthStart(year, month),
        endDate: getMonthEnd(year, month)
      };
    }

    case 'this-quarter': {
      const { startMonth, endMonth } = getQuarterInfo(now);
      return {
        startDate: getMonthStart(currentYear, startMonth),
        endDate: getMonthEnd(currentYear, endMonth)
      };
    }

    case 'last-quarter': {
      const lastQuarterDate = new Date(now);
      lastQuarterDate.setMonth(currentMonth - 3);
      const { startMonth, endMonth } = getQuarterInfo(lastQuarterDate);
      const year = lastQuarterDate.getFullYear();
      return {
        startDate: getMonthStart(year, startMonth),
        endDate: getMonthEnd(year, endMonth)
      };
    }

    case 'this-year': {
      return {
        startDate: new Date(currentYear, 0, 1),
        endDate: new Date(currentYear, 11, 31, 23, 59, 59, 999)
      };
    }

    case 'last-year': {
      return {
        startDate: new Date(currentYear - 1, 0, 1),
        endDate: new Date(currentYear - 1, 11, 31, 23, 59, 59, 999)
      };
    }

    default:
      throw new Error('Invalid period specified');
  }
}
