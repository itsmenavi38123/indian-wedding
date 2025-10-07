import {
  updateSection1,
  updateSection2,
  updateSection3,
  updateSection4,
  updateSection5,
  updateSection6,
} from '@/services/api/landingPage';
import { useMutation } from '@tanstack/react-query';

export function useUpdateSection1() {
  return useMutation({
    mutationFn: updateSection1,
  });
}

export function useUpdateSection2() {
  return useMutation({
    mutationFn: updateSection2,
  });
}

export const useUpdateSection3 = () => {
  return useMutation({
    mutationFn: updateSection3,
  });
};

export function useUpdateSection4() {
  return useMutation({
    mutationFn: updateSection4,
  });
}

export function useUpdateSection5() {
  return useMutation({
    mutationFn: updateSection5,
  });
}

export const useUpdateSection6 = () => {
  return useMutation({
    mutationFn: (payload: { heading: string }) => updateSection6(payload),
  });
};
