import { useState, useCallback } from 'react';
import api from '../config/api';

export const useGrading = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMySheet = useCallback(async (semesterId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/grading/my-sheet', { params: { semesterId } });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể lấy phiếu điểm cá nhân.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSheetById = useCallback(async (sheetId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/grading/sheet/${sheetId}`);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể lấy thông tin phiếu điểm.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitStudentScore = useCallback(async (semesterId: string, details: any[], isDraft: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/grading/submit', { semesterId, details, isDraft });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gửi điểm rèn luyện thất bại.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getClassStudents = useCallback(async (classId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/grading/class/${classId}`);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể lấy danh sách học sinh của lớp.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitBcsReview = useCallback(async (sheetId: string, details: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/grading/bcs-review/${sheetId}`, { details });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ban cán sự chấm điểm thất bại.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitCvhtApprove = useCallback(async (sheetId: string, details: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/grading/cvht-approve/${sheetId}`, { details });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cố vấn duyệt điểm thất bại.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getMySheet,
    getSheetById,
    submitStudentScore,
    getClassStudents,
    submitBcsReview,
    submitCvhtApprove,
    loading,
    error,
  };
};
