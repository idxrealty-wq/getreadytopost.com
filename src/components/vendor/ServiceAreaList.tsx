'use client';

import { useState, useEffect } from 'react';
import { ServiceArea } from '@/types/service-areas';
import ServiceAreaCounterGroup from './ServiceAreaCounterGroup';
import ServiceAreaForm from './ServiceAreaForm';
import { getServiceAreasByVendor, createServiceArea, deleteServiceArea } from '@/lib/api/service-areas';

interface ServiceAreaListProps {
  vendorId: string;
}

export default function ServiceAreaList({ vendorId }: ServiceAreaListProps) {
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArea, setEditingArea] = useState<ServiceArea | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAreas();
  }, [vendorId]);

  const loadAreas = async () => {
    try {
      setIsLoading(true);
      const data = await getServiceAreasByVendor(vendorId);
      setAreas(data);
      setError(null);
    } catch (err) {
      setError('Failed to load service areas');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingArea(undefined);
    setShowForm(true);
  };

  const handleEdit = (area: ServiceArea) => {
    setEditingArea(area);
    setShowForm(true);
  };

  const handleSubmit = async (
    areaData: Omit<ServiceArea, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      setIsLoading(true);
      await createServiceArea(areaData);
      await loadAreas();
      setShowForm(false);
      setEditingArea(undefined);
    } catch (err) {
      setError('Failed to save service area');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (areaId: string) => {
    if (!confirm('Delete this service area?')) return;

    try {
      setIsLoading(true);
      await deleteServiceArea(areaId);
      await loadAreas();
    } catch (err) {
      setError('Failed to delete service area');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ServiceAreaCounterGroup
        areas={areas}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {error && (
        <div className="mt-4 bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <ServiceAreaForm
          vendorId={vendorId}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingArea(undefined);
          }}
          initialData={editingArea}
        />
      )}
    </>
  );
}
