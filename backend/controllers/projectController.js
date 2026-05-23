import * as projectModel from '../models/projectModel.js';
import axios from 'axios';

const getGithubStructure = async (owner, repo) => {
  try {
    const headers = process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {};
    const repoName = repo.replace('.git', ''); 
    const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repoName}`, { headers });
    const defaultBranch = repoResponse.data.default_branch || 'main';

    const treeResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repoName}/git/trees/${defaultBranch}?recursive=1`,
      { headers }
    );

    const treeItems = Array.isArray(treeResponse.data.tree) ? treeResponse.data.tree : [];
    const maxDepth = Number.parseInt(process.env.GITHUB_TREE_DEPTH || '4', 10);
    const depthLimit = Number.isNaN(maxDepth) || maxDepth < 1 ? 4 : maxDepth;

    const isHiddenPath = (path) => path.split('/').some(part => part.startsWith('.'));

    const root = { name: '', type: 'dir', path: '', children: [] };
    const nodes = new Map();
    nodes.set('', root);

    for (const item of treeItems) {
      if (!item || !item.path || (item.type !== 'tree' && item.type !== 'blob')) {
        continue;
      }

      if (isHiddenPath(item.path)) {
        continue;
      }

      const parts = item.path.split('/');
      if (parts.length > depthLimit) {
        continue;
      }

      let currentPath = '';
      let parent = root;

      for (let i = 0; i < parts.length; i += 1) {
        const part = parts[i];
        const partPath = currentPath ? `${currentPath}/${part}` : part;
        const isLeaf = i === parts.length - 1;
        const nodeType = isLeaf ? (item.type === 'tree' ? 'dir' : 'file') : 'dir';

        if (!nodes.has(partPath)) {
          const node = {
            name: part,
            type: nodeType,
            path: partPath,
            children: nodeType === 'dir' ? [] : undefined
          };
          nodes.set(partPath, node);
          parent.children.push(node);
        } else if (isLeaf) {
          const node = nodes.get(partPath);
          node.type = nodeType;
          if (nodeType === 'dir' && !node.children) {
            node.children = [];
          }
        }

        parent = nodes.get(partPath);
        currentPath = partPath;
      }
    }

    return root.children;
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
