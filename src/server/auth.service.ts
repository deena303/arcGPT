import { User, UserRole } from '../types/index.js';

export const DEMO_USERS: User[] = [
  {
    id: 'user_admin_01',
    name: 'Dr. Eleanor Vance',
    email: 'admin.vance@arcai.edu',
    role: 'Admin',
    departmentCode: 'INSTITUTION',
    status: 'active',
    lastActive: 'Just now',
  },
  {
    id: 'user_hod_02',
    name: 'Prof. Rajesh Kumar',
    email: 'hod.aiml@arcai.edu',
    role: 'HOD',
    departmentId: 1,
    departmentCode: 'AIML',
    status: 'active',
    lastActive: '10 mins ago',
  },
  {
    id: 'user_faculty_03',
    name: 'Dr. Sarah Jenkins',
    email: 'faculty.cse@arcai.edu',
    role: 'Faculty',
    departmentId: 2,
    departmentCode: 'CSE',
    status: 'active',
    lastActive: '1 hour ago',
  },
  {
    id: 'user_faculty_04',
    name: 'Prof. Vikram Sharma',
    email: 'faculty.aiml@arcai.edu',
    role: 'Faculty',
    departmentId: 1,
    departmentCode: 'AIML',
    status: 'active',
    lastActive: 'Yesterday',
  },
  {
    id: 'user_hod_05',
    name: 'Dr. Anita Roy',
    email: 'hod.ece@arcai.edu',
    role: 'HOD',
    departmentId: 3,
    departmentCode: 'ECE',
    status: 'active',
    lastActive: '2 days ago',
  },
];

export class AuthService {
  private users: User[] = [...DEMO_USERS];

  public getAllUsers(): User[] {
    return this.users;
  }

  public getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  public getUserByRole(role: UserRole): User | undefined {
    return this.users.find(u => u.role === role);
  }

  public updateUserRole(userId: string, newRole: UserRole): User | null {
    const user = this.getUserById(userId);
    if (!user) return null;
    user.role = newRole;
    return user;
  }

  public addUser(userData: {
    name: string;
    email: string;
    role: UserRole;
    departmentCode?: string;
  }): User {
    const newUser: User = {
      id: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      departmentCode: userData.departmentCode || 'AIML',
      status: 'active',
      lastActive: 'Never',
    };
    this.users.push(newUser);
    return newUser;
  }

  public updateUser(
    userId: string,
    updates: Partial<Pick<User, 'name' | 'email' | 'role' | 'departmentCode' | 'status'>>
  ): User | null {
    const user = this.getUserById(userId);
    if (!user) return null;
    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    if (updates.role) user.role = updates.role;
    if (updates.departmentCode) user.departmentCode = updates.departmentCode;
    if (updates.status) user.status = updates.status;
    return user;
  }

  public toggleUserStatus(userId: string): User | null {
    const user = this.getUserById(userId);
    if (!user) return null;
    user.status = user.status === 'disabled' ? 'active' : 'disabled';
    return user;
  }

  public validateRoleAccess(user: User, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(user.role);
  }
}

export const authService = new AuthService();
