const STORAGE_KEY = 'purchasedProjects';

const readPurchasedProjects = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const writePurchasedProjects = (projectIds) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projectIds));
};

export const hasPurchasedProject = (projectId) => {
  return readPurchasedProjects().includes(String(projectId));
};

export const purchaseProject = (projectId) => {
  const projectKey = String(projectId);
  const purchased = readPurchasedProjects();

  if (!purchased.includes(projectKey)) {
    purchased.push(projectKey);
    writePurchasedProjects(purchased);
  }

  return purchased;
};

export const getPurchasedProjects = readPurchasedProjects;
