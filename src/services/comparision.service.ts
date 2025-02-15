import prisma from "../models";

const getDateRanges = (period) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today':
        return {
          current: {
            start: today,
            end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          },
          previous: {
            start: new Date(today.getTime() - 24 * 60 * 60 * 1000),
            end: today
          }
        };
      case 'thisMonth':
        return {
          current: {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: new Date(today.getFullYear(), today.getMonth() + 1, 0)
          },
          previous: {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
          }
        };
      case 'lastWeek':
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        return {
          current: {
            start: weekStart,
            end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
          },
          previous: {
            start: new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000),
            end: weekStart
          }
        };
      default:
        throw new Error('Invalid period specified');
    }
  };
  
  // Calculate percentage change
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  
  // Main comparison function for source types
  const getSourceTypeComparison = async (prisma, organizationId, period) => {
    const dateRanges = getDateRanges(period);
    
    // Get all source types
    const sourceTypes = await prisma.sourceType.findMany({
      where: { organizationId },
      include: {
        Deal: {
          where: {
            OR: [
              {
                dealDate: {
                  gte: dateRanges.current.start,
                  lt: dateRanges.current.end
                }
              },
              {
                dealDate: {
                  gte: dateRanges.previous.start,
                  lt: dateRanges.previous.end
                }
              }
            ]
          }
        }
      }
    });
  
    return sourceTypes.map(sourceType => {
      const currentDeals = sourceType.Deal.filter(
        deal => deal.dealDate >= dateRanges.current.start && 
                deal.dealDate < dateRanges.current.end
      );
      
      const previousDeals = sourceType.Deal.filter(
        deal => deal.dealDate >= dateRanges.previous.start && 
                deal.dealDate < dateRanges.previous.end
      );
  
      const currentValue = currentDeals.reduce((sum, deal) => sum + Number(deal.dealValue), 0);
      const previousValue = previousDeals.reduce((sum, deal) => sum + Number(deal.dealValue), 0);
  
      return {
        name: sourceType.name,
        currentValue,
        previousValue,
        currentCount: currentDeals.length,
        previousCount: previousDeals.length,
        percentageChange: calculatePercentageChange(currentValue, previousValue)
      };
    });
  };
  
  // Main comparison function for work types
  const getWorkTypeComparison = async (prisma, organizationId, period) => {
    const dateRanges = getDateRanges(period);
    
    // Get all work types with their deals and payments
    const workTypes = await prisma.workType.findMany({
      where: { organizationId },
      include: {
        Deal: {
          where: {
            OR: [
              {
                dealDate: {
                  gte: dateRanges.current.start,
                  lt: dateRanges.current.end
                }
              },
              {
                dealDate: {
                  gte: dateRanges.previous.start,
                  lt: dateRanges.previous.end
                }
              }
            ]
          },
          include: {
            Payment: true
          }
        }
      }
    });
  
    return workTypes.map(workType => {
      const currentDeals = workType.Deal.filter(
        deal => deal.dealDate >= dateRanges.current.start && 
                deal.dealDate < dateRanges.current.end
      );
      
      const previousDeals = workType.Deal.filter(
        deal => deal.dealDate >= dateRanges.previous.start && 
                deal.dealDate < dateRanges.previous.end
      );
  
      const currentPayments = currentDeals.flatMap(deal => 
        deal.Payment.filter(payment => 
          payment.paymentDate >= dateRanges.current.start && 
          payment.paymentDate < dateRanges.current.end
        )
      );
  
      const previousPayments = previousDeals.flatMap(deal => 
        deal.Payment.filter(payment => 
          payment.paymentDate >= dateRanges.previous.start && 
          payment.paymentDate < dateRanges.previous.end
        )
      );
  
      return {
        name: workType.name,
        currentValue: currentPayments.reduce((sum, payment) => sum + Number(payment.receivedAmount), 0),
        previousValue: previousPayments.reduce((sum, payment) => sum + Number(payment.receivedAmount), 0),
        currentCount: currentPayments.length,
        previousCount: previousPayments.length,
        percentageChange: calculatePercentageChange(
          currentPayments.reduce((sum, payment) => sum + Number(payment.receivedAmount), 0),
          previousPayments.reduce((sum, payment) => sum + Number(payment.receivedAmount), 0)
        )
      };
    });
  };
  
  // Example route handler
  export const getDashboardComparison = async (args:any,orgId:string) => {
    const { period = 'thisMonth' } = args
  
    try {
      const [sourceTypeStats, workTypeStats] = await Promise.all([
        getSourceTypeComparison(prisma, orgId, period),
        getWorkTypeComparison(prisma, orgId, period)
      ]);
    } catch (error) {
     throw error
    }
  };