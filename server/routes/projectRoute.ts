import express from 'express';
import { protect } from '../middleware/auth.js';
import { deleteProject, getProjectById, getProjectPreview, getPublishedProject, makeRevision, rollbackToVersion, saveProjectCode } from '../controllers/projectController.js';
import { promiseHooks } from 'node:v8';

const projectRouter = express.Router();

projectRouter.post('/revision/:projectId', protect, makeRevision);
projectRouter.put('/save/:projectId',protect,saveProjectCode);
projectRouter.get('/rollback/:projectId/:revisionId',protect,rollbackToVersion);
projectRouter.delete('/:projectId',protect,deleteProject);
projectRouter.get('/preview/:projectId',protect,getProjectPreview);
projectRouter.get('/published', getPublishedProject);
projectRouter.get('/view/:projectId', getProjectById);

export default projectRouter;