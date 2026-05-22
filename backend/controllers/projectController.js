import * as projectModel from '../models/projectModel.js';
import axios from 'axios';

const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const getGithubStructure = async (
  owner,
  repo,
  path = '',
  depth = 0
) => {

  try {

    // Prevent huge recursion
    if (depth > 2) return [];

    const headers = process.env.GITHUB_TOKEN
      ? {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        }
      : {};

    const repoName = repo.replace('.git', '');

    const url = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`;

    console.log('Fetching:', url);

    const response = await axios.get(url, { headers });
    console.log("GITHUB API RESPONSE:");
console.log(response.data);

    // Ensure array
    const items = Array.isArray(response.data)
      ? response.data
      : [];

    const tree = [];

    for (const item of items) {

      // Skip hidden files
      if (item.name.startsWith('.')) continue;

      const node = {
        name: item.name,
        type: item.type,
        path: item.path,
      };

      // Recursively fetch folders
      if (item.type === 'dir') {

        node.children = await getGithubStructure(
          owner,
          repo,
          item.path,
          depth + 1
        );
      }

      tree.push(node);
    }

    return tree;

  } catch (err) {

    console.error(
      `Error fetching GitHub structure for path "${path}":`,
      err.response?.status,
      err.message
    );

    return [];
  }
};

export const uploadProject = async (req, res) => {

  try {

    const {
      title,
      github_link,
      demo_link,
      description,
      tech_stack,
      price
    } = req.body;

    // Validation
    if (
      !title ||
      !github_link ||
      !demo_link ||
      !description ||
      !tech_stack ||
      price === undefined
    ) {
      return res.status(400).json({
        error: 'All fields required'
      });
    }

    // URL validation
    if (
      !isValidHttpUrl(github_link) ||
      !isValidHttpUrl(demo_link)
    ) {
      return res.status(400).json({
        error: 'Provide valid GitHub and demo URLs'
      });
    }

    // Extract GitHub owner/repo
    const urlMatch = github_link.match(
      /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?\/?$/
    );

    if (!urlMatch) {
      return res.status(400).json({
        error:
          'Invalid GitHub URL format. Use: https://github.com/owner/repo'
      });
    }

    const owner = urlMatch[1];
    const repo = urlMatch[2];

    console.log('Owner:', owner);
    console.log('Repo:', repo);

    // Fetch repo structure
    const structure = await getGithubStructure(owner, repo);

    console.log(
      'Fetched Structure:',
      JSON.stringify(structure, null, 2)
    );

    // Save project
    const project = await projectModel.createProject(
      title,
      github_link,
      demo_link,
      description,
      tech_stack,
      price,
      req.user.id
    );

    return res.status(201).json({
      message: 'Project uploaded successfully',
      project,
      structure
    });

  } catch (err) {

    console.error('Upload error:', err);

    return res.status(500).json({
      error: 'Server error'
    });
  }
};

export const getAllProjects = async (req, res) => {

  try {

    const projects = await projectModel.getAllProjects();

    res.json(projects);

  } catch (err) {

    console.error('Get projects error:', err);

    res.status(500).json({
      error: 'Server error'
    });
  }
};

export const getProjectById = async (req, res) => {

  try {

    const { id } = req.params;

    const project = await projectModel.getProjectById(id);

    if (!project) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    const urlMatch = project.github_link.match(
      /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?\/?$/
    );

    let structure = [];

    if (urlMatch) {

      const owner = urlMatch[1];
      const repo = urlMatch[2];

      structure = await getGithubStructure(owner, repo);
    }

    res.json({
      ...project,
      structure
    });

  } catch (err) {

    console.error('Get project error:', err);

    res.status(500).json({
      error: 'Server error'
    });
  }
};

export const getCreatorProjects = async (req, res) => {

  try {

    const projects = await projectModel.getProjectsByCreator(
      req.user.id
    );

    res.json(projects);

  } catch (err) {

    console.error('Get creator projects error:', err);

    res.status(500).json({
      error: 'Server error'
    });
  }
};

export const upvoteProject = async (req, res) => {

  try {

    const { id } = req.params;

    const project = await projectModel.upvoteProject(id);

    res.json({
      message: 'Upvoted successfully',
      project
    });

  } catch (err) {

    console.error('Upvote error:', err);

    res.status(500).json({
      error: 'Server error'
    });
  }
};

export const deleteProject = async (req, res) => {

  try {

    const { id } = req.params;

    const project = await projectModel.getProjectById(id);

    if (!project) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    await projectModel.deleteProject(id);

    res.json({
      message: 'Project deleted successfully'
    });

  } catch (err) {

    console.error('Delete error:', err);

    res.status(500).json({
      error: 'Server error'
    });
  }
};

export const updateProject = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      title,
      description,
      price,
      tech_stack
    } = req.body;

    const updated = await projectModel.updateProject(
      id,
      title,
      description,
      price,
      tech_stack
    );

    res.json({
      message: 'Project updated successfully',
      project: updated
    });

  } catch (err) {

    console.error('Update error:', err);

    res.status(500).json({
      error: 'Server error'
    });
  }
};