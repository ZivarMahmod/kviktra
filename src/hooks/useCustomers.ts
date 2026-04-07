import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Customer } from '../types';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const addCustomer = useCallback((customer: Omit<Customer, 'id' | 'created_at'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    return newCustomer;
  }, []);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getCustomer = useCallback(
    (id: string) => customers.find((c) => c.id === id),
    [customers]
  );

  return { customers, addCustomer, updateCustomer, deleteCustomer, getCustomer };
}
