'use client';

import React, { use } from 'react';
import { notFound } from 'next/navigation';
import { PROBLEMS } from '@/data/problems';
import ProblemInterface from '@/components/practice/ProblemInterface';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function PracticeProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const problem = PROBLEMS[id];

  if (!problem) {
    notFound();
  }

  return (
    <ProtectedRoute>
      <ProblemInterface problem={problem} />
    </ProtectedRoute>
  );
}
