import { generateAlert } from "./generateAlert.cjs";

export const getDashboardMetrics = async () => {

  const alerts = Array.from({ length: 100 }, () => generateAlert());

  const total = alerts.length;

  const escalated = alerts.filter(a => a.details.severity === 1).length;

  const resolved = alerts.filter(a => a.status === "CONFIRMED").length;

  const complianceEvents = alerts.filter(a =>
    a.details.typeDescription === "SEATBELT-COMPLIANCE" ||
    a.details.typeDescription === "FACE-MASK-COMPLIANCE"
  ).length;

  const compliance = Math.round((complianceEvents / total) * 100);

  const critical = alerts.filter(a => a.details.severity === 1).length;
  const high = alerts.filter(a => a.details.severity === 2).length;
  const medium = alerts.filter(a => a.details.severity === 3).length;
  const low = alerts.filter(a => a.details.severity === 4).length;

  return {
    totalEvents: total,
    escalated,
    resolved,
    compliance,
    critical,
    high,
    medium,
    low
  };

};