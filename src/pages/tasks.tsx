import ProtectedRoute from '@/components/ProtectedRoute';
import Board from '@/components/Tasks/Board';

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <h1 className="text-xl font-bold mb-4 text-lightBlue">Tasks</h1>
      <Board />
    </ProtectedRoute>
  );
}