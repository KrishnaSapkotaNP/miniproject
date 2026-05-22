import { supabase } from './supabaseClient';

const parseGithubLink = (githubLink) => {
  if (!githubLink) return null;
  const match = githubLink.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
};

const getGithubHeaders = () => {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  return token ? { Authorization: `token ${token}` } : {};
};

const fetchGithubStructure = async (owner, repo, path = '', depth = 0) => {
  if (depth > 2) return [];

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const response = await fetch(url, { headers: getGithubHeaders() });

  if (!response.ok) return [];

  const items = await response.json();
  if (!Array.isArray(items)) return [];

  const tree = [];
  for (const item of items) {
    if (item.name?.startsWith('.')) continue;

    const node = {
      name: item.name,
      type: item.type,
      path: item.path,
    };

    if (item.type === 'dir') {
      node.children = await fetchGithubStructure(owner, repo, item.path, depth + 1);
    }

    tree.push(node);
  }

  return tree;
};

const getGithubStructure = async (githubLink) => {
  try {
    const parsed = parseGithubLink(githubLink);
    if (!parsed) return [];
    return await fetchGithubStructure(parsed.owner, parsed.repo);
  } catch (error) {
    return [];
  }
};

const getUserProfileById = async (userId) => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
};

const getCurrentUserProfile = async () => {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    return { error: 'Unauthorized' };
  }

  const profile = await getUserProfileById(authData.user.id);
  if (!profile) {
    return { error: 'User profile not found' };
  }

  return { user: profile };
};

const normalizeRequest = (request) => {
  if (!request) return request;
  const user = request.users || {};
  return {
    ...request,
    name: request.name || user.name,
    email: request.email || user.email,
  };
};

export const api = {
  // Auth
  register: async (name, email, password, confirm_password) => {
    if (!name || !email || !password || !confirm_password) {
      return { error: 'All fields are required' };
    }

    if (password !== confirm_password) {
      return { error: 'Passwords do not match' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data?.user?.id) {
      const { error: insertError } = await supabase.from('users').insert({
        id: data.user.id,
        name,
        email,
        role: 'viewer',
      });

      if (insertError) {
        return { error: insertError.message };
      }
    }

    return {
      message: 'Registration successful',
      user: { id: data?.user?.id, name, email, role: 'viewer' },
    };
  },

  login: async (email, password) => {
    if (!email || !password) {
      return { error: 'Email and password required' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    const profile = await getUserProfileById(data?.user?.id);
    const fallbackProfile = {
      id: data?.user?.id,
      name: data?.user?.user_metadata?.name || 'User',
      email: data?.user?.email,
      role: data?.user?.user_metadata?.role || 'viewer',
    };

    return {
      message: 'Login successful',
      token: data?.session?.access_token,
      user: profile || fallbackProfile,
    };
  },

  getMe: async () => {
    const { data: authData, error } = await supabase.auth.getUser();
    if (error || !authData?.user) {
      return { error: 'Unauthorized' };
    }

    const profile = await getUserProfileById(authData.user.id);
    if (!profile) {
      return { error: 'User not found' };
    }

    return profile;
  },

  // Projects
  getAllProjects: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('id', { ascending: false });

    if (error) return [];
    return data || [];
  },

  getProjectById: async (id) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    const structure = await getGithubStructure(data.github_link);
    return { ...data, structure };
  },

  uploadProject: async (title, github_link, demo_link, description, tech_stack, price) => {
    const { user, error } = await getCurrentUserProfile();
    if (error) return { error };

    if (user.role !== 'creator') {
      return { error: 'Only creators can upload projects' };
    }

    const { data, error: insertError } = await supabase
      .from('projects')
      .insert({
        title,
        github_link,
        demo_link,
        description,
        tech_stack,
        price,
        creator_id: user.id,
        upvotes: 0,
      })
      .select('*')
      .single();

    if (insertError) return { error: insertError.message };

    return {
      message: 'Project uploaded successfully',
      project: data,
      structure: [],
    };
  },

  getCreatorProjects: async () => {
    const { user, error } = await getCurrentUserProfile();
    if (error) return { error };

    const { data, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('creator_id', user.id)
      .order('id', { ascending: false });

    if (fetchError) return { error: fetchError.message };
    return data || [];
  },

  upvoteProject: async (id) => {
    const { data: current, error: fetchError } = await supabase
      .from('projects')
      .select('upvotes')
      .eq('id', id)
      .single();

    if (fetchError) return { error: fetchError.message };

    const nextUpvotes = (current?.upvotes || 0) + 1;
    const { data, error } = await supabase
      .from('projects')
      .update({ upvotes: nextUpvotes })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return { error: error.message };
    return { message: 'Upvoted successfully', project: data };
  },

  updateProject: async (id, title, description, price, tech_stack) => {
    const { data, error } = await supabase
      .from('projects')
      .update({ title, description, price, tech_stack })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return { error: error.message };
    return { message: 'Project updated successfully', project: data };
  },

  deleteProject: async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return { error: error.message };
    return { message: 'Project deleted successfully' };
  },

  // Creator Requests
  submitCreatorRequest: async (sample_work_link, message) => {
    const { user, error } = await getCurrentUserProfile();
    if (error) return { error };

    const { data: existing } = await supabase
      .from('creator_requests')
      .select('id, status')
      .eq('user_id', user.id)
      .order('id', { ascending: false })
      .limit(1);

    if (existing?.[0]?.status === 'pending') {
      return { error: 'You already have a pending creator request' };
    }

    const { data, error: insertError } = await supabase
      .from('creator_requests')
      .insert({
        user_id: user.id,
        sample_work_link,
        message,
        status: 'pending',
      })
      .select('*')
      .single();

    if (insertError) return { error: insertError.message };
    return { message: 'Request submitted successfully', request: data };
  },

  getMyRequest: async () => {
    const { user, error } = await getCurrentUserProfile();
    if (error) return { error };

    const { data, error: fetchError } = await supabase
      .from('creator_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('id', { ascending: false })
      .limit(1);

    if (fetchError) return { error: fetchError.message };
    return data?.[0] || null;
  },

  // Admin
  getPendingRequests: async () => {
    const { data, error } = await supabase
      .from('creator_requests')
      .select('id, user_id, sample_work_link, message, status, created_at, users(name, email)')
      .eq('status', 'pending')
      .order('id', { ascending: false });

    if (error) return [];
    return (data || []).map(normalizeRequest);
  },

  getAllRequests: async () => {
    const { data, error } = await supabase
      .from('creator_requests')
      .select('id, user_id, sample_work_link, message, status, created_at, users(name, email)')
      .order('id', { ascending: false });

    if (error) return [];
    return (data || []).map(normalizeRequest);
  },

  approveRequest: async (id) => {
    const { data: request, error: fetchError } = await supabase
      .from('creator_requests')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError) return { error: fetchError.message };

    const { error: updateError } = await supabase
      .from('creator_requests')
      .update({ status: 'approved' })
      .eq('id', id);

    if (updateError) return { error: updateError.message };

    const { data: user, error: userError } = await supabase
      .from('users')
      .update({ role: 'creator' })
      .eq('id', request.user_id)
      .select('id, name, email, role')
      .single();

    if (userError) return { error: userError.message };

    return { message: 'Request approved', user };
  },

  rejectRequest: async (id) => {
    const { error } = await supabase
      .from('creator_requests')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) return { error: error.message };
    return { message: 'Request rejected' };
  },

  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .order('id', { ascending: false });

    if (error) return [];
    return data || [];
  },
};
