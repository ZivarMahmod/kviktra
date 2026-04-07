import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Job, JobStatus } from '../types';

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);

  const addJob = useCallback((job: Omit<Job, 'id' | 'created_at'>) => {
    const newJob: Job = {
      ...job,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    setJobs((prev) => [newJob, ...prev]);
    return newJob;
  }, []);

  const updateJobStatus = useCallback((id: string, status: JobStatus) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, status, end_date: status === 'Klar' || status === 'Fakturerad' ? new Date().toISOString().split('T')[0] : j.end_date }
          : j
      )
    );
  }, []);

  const linkInvoice = useCallback((id: string, invoiceRef: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, invoice_ref: invoiceRef, status: 'Fakturerad' as JobStatus } : j))
    );
  }, []);

  return { jobs, addJob, updateJobStatus, linkInvoice };
}
