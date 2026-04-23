import express from 'express';
import { 
    createProject, 
    makeRevision, 
    rollbackToVersion, 
    getProject, 
    getProjects, 
    deleteProject, 
    togglePublish, 
    getPublishedProjects,
    saveProjectCode,
    getProjectCode
} from '../controllers/ProjectController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const projectRouter = express.Router();

// Protected routes (require auth)
projectRouter.post('/', protect, createProject);
projectRouter.get('/', protect, getProjects);
projectRouter.get('/:projectId', protect, getProject);
projectRouter.delete('/:projectId', protect, deleteProject);
projectRouter.post('/:projectId/save', protect, saveProjectCode);
projectRouter.post('/:projectId/revision', protect, makeRevision);
projectRouter.post('/:projectId/rollback/:versionId', protect, rollbackToVersion);
projectRouter.get('/:projectId/toggle-publish', protect, togglePublish);

// Public routes (no auth required)
projectRouter.get('/community/all', getPublishedProjects);
projectRouter.get('/public/:projectId', optionalAuth, getProjectCode);

export default projectRouter;
