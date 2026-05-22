import * as projectModel from '../models/projectModel.js';
import axios from 'axios';

const getGithubStructure = async (owner, repo) => {
  try {
    const headers = process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {};
    const repoName = repo.replace('.git', ''); 
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/contents/`, { headers });
    
    const buildTree = (items, depth = 0) => {
      if (depth > 3) return []; 
      
      return items
        .filter(item => !item.name.startsWith('.'))
        .map(item => ({
          name: item.name,
          type: item.type,
          path: item.path,
          children: item.type === 'dir' ? [] : undefined
        }));
    };

    return buildTree(response.data);
  } catch (err) {
    console.error('Error fetching GitHub structure:', err.response?.status, err.message);
    return []; 
  }
};

export const uploadProject = async (req, res) => {
  try {
    const { title, github_link, demo_link, description, tech_stack, price } = req.body;

    if (!title || !github_link || !description || !tech_stack || !price) {
      return res.status(400).json({ error: 'All fields required' });
    }

    
    const urlMatch = github_link.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
    if (!urlMatch) {
      return res.status(400).json({ error: 'Invalid GitHub URL format. Use: https://github.com/owner/repo' });
    }

    const structure = await getGithubStructure(urlMatch[1], urlMatch[2]);

    const project = await projectModel.createProject(title, github_link, demo_link, description, tech_stack, price, req.user.id);
    
    res.status(201).json({ 
      message: 'Project uploaded successfully', 
      project,
      structure 
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await projectModel.getAllProjects();
    res.json(projects);
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectModel.getProjectById(id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }


    const urlMatch = project.github_link.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
    const structure = urlMatch ? await getGithubStructure(urlMatch[1], urlMatch[2]) : [];

    res.json({ ...project, structure });
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCreatorProjects = async (req, res) => {
  try {
    const projects = await projectModel.getProjectsByCreator(req.user.id);
    res.json(projects);
  } catch (err) {
    console.error('Get creator projects error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const upvoteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectModel.upvoteProject(id);
    res.json({ message: 'Upvoted successfully', project });
  } catch (err) {
    console.error('Upvote error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectModel.getProjectById(id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await projectModel.deleteProject(id);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, tech_stack, demo_link } = req.body;

    const updated = await projectModel.updateProject(id, title, description, price, tech_stack, demo_link);
    res.json({ message: 'Project updated successfully', project: updated });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
