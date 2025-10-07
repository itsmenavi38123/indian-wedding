import { useQuery } from '@tanstack/react-query';
import { pipelineService } from './pipelineService';
import { API_QUERY_KEYS } from '../apiBaseUrl';

export const usePipelineSummary = () => {
  return useQuery({
    queryKey: [API_QUERY_KEYS.pipeline.summary],
    queryFn: pipelineService.fetchPipelineSummary,
  });
};
