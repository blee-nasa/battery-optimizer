import { Routes, Route, Navigate } from 'react-router-dom'
import { MaterialsView, CathodesView, OptimizerView } from '@views'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<OptimizerView />} />
      <Route path="/materials" element={<MaterialsView />} />
      <Route path="/cathodes" element={<CathodesView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
