"use client";
import { useTranslate } from '@/hooks/useTranslate';
import React from 'react'

export default function TestPage() {
  const { translatedText, isLoading, error } = useTranslate('안녕하세요');
  
  return (
    <div>
      <h1>Test Page</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <p>{translatedText}</p>
      )}
    </div>
  )
}
