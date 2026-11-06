import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function generateJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SB-${suffix}`;
}

export function getDashboardPathForRole(role) {
  if (role === 'super_admin') return '/admin-dashboard';
  if (role === 'student') return '/student-dashboard';
  return '/mess-owner-dashboard';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfileFromSupabase = async (authUser) => {
    if (!authUser || !supabase) return null;
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    const role = profile?.role || authUser.user_metadata?.role || 'student';
    const fullName =
      profile?.full_name ||
      authUser.user_metadata?.full_name ||
      authUser.email?.split('@')[0] ||
      'User';
    let messName =
      profile?.mess_name || authUser.user_metadata?.mess_name || '';
    let collegeName =
      profile?.college_name || authUser.user_metadata?.college_name || '';
    let hostelName =
      profile?.hostel_name || authUser.user_metadata?.hostel_name || '';
    let studentId =
      profile?.student_id_code || authUser.user_metadata?.student_id_code || '';
    const phone = profile?.phone || authUser.user_metadata?.phone || '';

    let messId = profile?.mess_id || authUser.user_metadata?.mess_id || null;
    let collegeId =
      profile?.college_id || authUser.user_metadata?.college_id || null;
    const metaJoinCode = (authUser.user_metadata?.join_code || '')
      .trim()
      .toUpperCase();

    // Ensure a real mess row exists for a newly registered mess_owner (with 0 sample data)
    if (role === 'mess_owner') {
      let ownerMess = null;
      if (messId) {
        const { data } = await supabase
          .from('messes')
          .select('*')
          .eq('id', messId)
          .maybeSingle();
        ownerMess = data;
      }
      if (!ownerMess) {
        const { data } = await supabase
          .from('messes')
          .select('*')
          .eq('owner_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        ownerMess = data;
      }

      if (ownerMess) {
        messId = ownerMess.id;
        collegeId = ownerMess.college_id || collegeId;
        messName = ownerMess.name || messName;
        collegeName = ownerMess.college_name || collegeName;
        const messUpdates = {};
        if (!ownerMess.join_code) {
          messUpdates.join_code = generateJoinCode();
        }
        if (!ownerMess.owner_id) {
          messUpdates.owner_id = authUser.id;
        }
        if (Object.keys(messUpdates).length > 0) {
          await supabase
            .from('messes')
            .update(messUpdates)
            .eq('id', ownerMess.id);
        }
      } else {
        // Lookup or create college first
        if (!collegeId && collegeName) {
          const { data: existingCol } = await supabase
            .from('colleges')
            .select('id, name')
            .ilike('name', collegeName.trim())
            .limit(1)
            .maybeSingle();
          if (existingCol) {
            collegeId = existingCol.id;
          } else {
            const { data: createdCol } = await supabase
              .from('colleges')
              .insert([{ name: collegeName.trim(), is_active: true }])
              .select('id')
              .maybeSingle();
            if (createdCol) collegeId = createdCol.id;
          }
        }

        const { data: createdMess } = await supabase
          .from('messes')
          .insert([
            {
              owner_id: authUser.id,
              college_id: collegeId,
              name: messName || `${fullName}'s Mess`,
              college_name: collegeName || 'Institution',
              hostel_name: hostelName || '',
              contact_number: phone || '',
              capacity: 0,
              registered_students: 0,
              join_code: generateJoinCode(),
              status: 'active',
            },
          ])
          .select()
          .maybeSingle();

        if (createdMess) {
          messId = createdMess.id;
          messName = createdMess.name;
        }
      }

      if (messId && profile && profile.mess_id !== messId) {
        await supabase
          .from('profiles')
          .update({ mess_id: messId, college_id: collegeId, mess_name: messName })
          .eq('id', authUser.id);
      }
    }

    // Student role: Check public.students row and link mess_id if provided via dropdown or join_code
    if (role === 'student') {
      const { data: studentRow } = await supabase
        .from('students')
        .select('*')
        .eq('profile_id', authUser.id)
        .maybeSingle();

      // Priority: students.mess_id -> profiles.mess_id -> signup metadata mess_id -> signup metadata join_code
      messId = studentRow?.mess_id || profile?.mess_id || messId || null;

      if (!messId && metaJoinCode) {
        const { data: joinedMess } = await supabase
          .from('messes')
          .select('id, name, college_id, college_name')
          .ilike('join_code', metaJoinCode)
          .limit(1)
          .maybeSingle();
        if (joinedMess) {
          messId = joinedMess.id;
          messName = joinedMess.name;
          collegeId = joinedMess.college_id || collegeId;
          collegeName = joinedMess.college_name || collegeName;
        }
      }

      // If messId is known, fetch the mess details so student sees their linked mess name & college
      if (messId) {
        const { data: linkedMess } = await supabase
          .from('messes')
          .select('id, name, college_id, college_name')
          .eq('id', messId)
          .maybeSingle();
        if (linkedMess) {
          messName = linkedMess.name || messName;
          collegeId = linkedMess.college_id || collegeId;
          collegeName = linkedMess.college_name || collegeName;
        }
      }

      // Ensure student row exists in public.students and has mess_id synced if messId is known
      if (!studentRow) {
        await supabase.from('students').insert([
          {
            profile_id: authUser.id,
            college_id: collegeId,
            mess_id: messId,
            full_name: fullName,
            email: authUser.email,
            student_roll_id: studentId || `STU-${authUser.id.slice(0, 6)}`,
            college_name: collegeName || 'Institution',
            hostel_name: hostelName || 'Hostel',
            meal_entitlement_active: true,
          },
        ]);
      } else if (messId && studentRow.mess_id !== messId) {
        await supabase
          .from('students')
          .update({
            mess_id: messId,
            college_id: collegeId,
            college_name: collegeName || studentRow.college_name,
          })
          .eq('profile_id', authUser.id);
      }

      if (messId && profile && profile.mess_id !== messId) {
        await supabase
          .from('profiles')
          .update({
            mess_id: messId,
            college_id: collegeId,
            mess_name: messName,
            college_name: collegeName,
          })
          .eq('id', authUser.id);
      }

      if (studentRow) {
        hostelName = studentRow.hostel_name || hostelName;
        studentId = studentRow.student_roll_id || studentId;
      }
    }

    return {
      id: authUser.id,
      email: authUser.email,
      fullName,
      full_name: fullName,
      role,
      messId,
      collegeId,
      messName,
      collegeName,
      hostelName,
      studentId,
      phone,
      entitlementActive: true,
      isDemoUser: false,
    };
  };

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      if (isSupabaseConfigured && supabase) {
        // Clear any leftover demo session when Supabase is configured unless user explicitly enters Demo Mode
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            localStorage.removeItem('smartbite_demo_session');
            const profileUser = await loadUserProfileFromSupabase(session.user);
            if (mounted) setUser(profileUser);
          } else {
            const savedDemo = localStorage.getItem('smartbite_demo_session');
            if (savedDemo && mounted) {
              try {
                const parsed = JSON.parse(savedDemo);
                if (parsed?.isDemoUser) setUser(parsed);
              } catch {
                localStorage.removeItem('smartbite_demo_session');
              }
            }
          }
        } catch {
          // ignore session fetch error
        } finally {
          if (mounted) setLoading(false);
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            localStorage.removeItem('smartbite_demo_session');
            const profileUser = await loadUserProfileFromSupabase(session.user);
            if (mounted) setUser(profileUser);
          } else {
            const demoSaved = localStorage.getItem('smartbite_demo_session');
            if (!demoSaved && mounted) setUser(null);
          }
        });

        return () => subscription.unsubscribe();
      } else {
        // Demo Mode: restore demo session if present
        const savedDemo = localStorage.getItem('smartbite_demo_session');
        if (savedDemo) {
          try {
            setUser(JSON.parse(savedDemo));
          } catch {
            localStorage.removeItem('smartbite_demo_session');
          }
        }
        if (mounted) setLoading(false);
      }
    }

    initSession();
    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Sign in with email & password (uses real Supabase Auth when configured)
   */
  const login = async ({ email, password }) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'Supabase credentials are not configured in .env. Please use the clearly labelled Demo Mode buttons below to test role-based dashboards.'
      );
    }

    localStorage.removeItem('smartbite_demo_session');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    const profileUser = await loadUserProfileFromSupabase(data.user);
    setUser(profileUser);
    return { user: profileUser };
  };

  /**
   * Explicitly separated Demo Mode login so sample data ONLY appears in Demo Mode
   */
  const loginWithDemoRole = (role = 'mess_owner', customFields = {}) => {
    const demoProfiles = {
      mess_owner: {
        id: 'demo-owner-001',
        email: customFields.email || 'operator@greenfieldmess.edu',
        fullName: customFields.fullName || 'Vikramaditya Mehta',
        full_name: customFields.fullName || 'Vikramaditya Mehta',
        role: 'mess_owner',
        messId: 'mess-demo-001',
        messName: customFields.messName || 'Annapurna Central Hostel Mess',
        collegeName:
          customFields.collegeName ||
          'National Institute of Technology (NIT) Campus',
        phone: customFields.phone || '+91 98450 22190',
        entitlementActive: true,
        isDemoUser: true,
      },
      student: {
        id: 'demo-student-001',
        email: customFields.email || 'aarav.sharma@nit.edu.in',
        fullName: customFields.fullName || 'Aarav Sharma',
        full_name: customFields.fullName || 'Aarav Sharma',
        role: 'student',
        messId: 'mess-demo-001',
        messName: customFields.messName || 'Annapurna Central Hostel Mess',
        collegeName:
          customFields.collegeName ||
          'National Institute of Technology (NIT) Campus',
        hostelName: customFields.hostelName || 'Hostel Block A',
        studentId: customFields.studentId || '2024CS101',
        entitlementActive: true,
        isDemoUser: true,
      },
      super_admin: {
        id: 'demo-admin-001',
        email: 'superadmin@smartbite.ai',
        fullName: 'SmartBite Platform Admin',
        full_name: 'SmartBite Platform Admin',
        role: 'super_admin',
        messId: 'mess-demo-001',
        collegeName: 'SmartBite HQ Governance',
        entitlementActive: true,
        isDemoUser: true,
      },
    };

    const chosen = demoProfiles[role] || demoProfiles.mess_owner;
    localStorage.setItem('smartbite_demo_session', JSON.stringify(chosen));
    setUser(chosen);
    return { user: chosen };
  };

  /**
   * Public Registration for Mess Owner or Student
   * Security Rule: Never allow public registration for super_admin
   * Never inserts sample data on registration.
   */
  const register = async (payload) => {
    const {
      role,
      fullName,
      email,
      password,
      messId,
      messName,
      collegeId,
      collegeName,
      joinCode,
      phone,
      hostelName,
      studentId,
    } = payload;

    if (role === 'super_admin') {
      throw new Error(
        'Public registration for Super Admin is prohibited. Super Admin accounts must be provisioned securely via the database migration procedure.'
      );
    }

    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'Supabase is not connected (.env missing). Use the "Continue in Demo Mode" button below to test registration and role routing.'
      );
    }

    localStorage.removeItem('smartbite_demo_session');

    let resolvedMessId = messId || null;
    let resolvedMessName = messName || null;
    let resolvedCollegeId = collegeId || null;
    let resolvedCollegeName = collegeName || '';

    // For student signup: verify the chosen mess (by messId or joinCode) exists and is active
    if (role === 'student') {
      if (!resolvedMessId && joinCode?.trim()) {
        const { data: codeMess } = await supabase
          .from('messes')
          .select('id, name, college_id, college_name, status')
          .ilike('join_code', joinCode.trim())
          .limit(1)
          .maybeSingle();

        if (!codeMess) {
          throw new Error(
            `No active mess found with Join Code "${joinCode.trim().toUpperCase()}". Please check the code shared by your Mess Owner or select your mess from the dropdown.`
          );
        }
        resolvedMessId = codeMess.id;
        resolvedMessName = codeMess.name;
        resolvedCollegeId = codeMess.college_id || resolvedCollegeId;
        resolvedCollegeName = codeMess.college_name || resolvedCollegeName;
      } else if (resolvedMessId) {
        const { data: selectedMess } = await supabase
          .from('messes')
          .select('id, name, college_id, college_name')
          .eq('id', resolvedMessId)
          .maybeSingle();
        if (selectedMess) {
          resolvedMessName = selectedMess.name;
          resolvedCollegeId = selectedMess.college_id || resolvedCollegeId;
          resolvedCollegeName = selectedMess.college_name || resolvedCollegeName;
        }
      }

      if (!resolvedMessId) {
        throw new Error(
          'Please select your Mess from the dropdown or enter a valid Mess Join Code.'
        );
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role === 'mess_owner' ? 'mess_owner' : 'student',
          full_name: fullName,
          mess_id: resolvedMessId,
          college_id: resolvedCollegeId,
          mess_name: resolvedMessName,
          college_name: resolvedCollegeName,
          join_code: joinCode ? joinCode.trim().toUpperCase() : null,
          phone: phone || null,
          hostel_name: hostelName || null,
          student_id_code: studentId || null,
          entitlement_active: true,
        },
      },
    });

    if (error) throw error;

    if (data?.user) {
      // Ensure students.mess_id and profiles.mess_id are explicitly linked even if older DB trigger ran
      if (role === 'student' && resolvedMessId) {
        await supabase
          .from('profiles')
          .update({
            mess_id: resolvedMessId,
            college_id: resolvedCollegeId,
            mess_name: resolvedMessName,
            college_name: resolvedCollegeName,
            hostel_name: hostelName || null,
            student_id_code: studentId || null,
          })
          .eq('id', data.user.id);

        const { data: existingStu } = await supabase
          .from('students')
          .select('id')
          .eq('profile_id', data.user.id)
          .maybeSingle();

        if (existingStu) {
          await supabase
            .from('students')
            .update({
              mess_id: resolvedMessId,
              college_id: resolvedCollegeId,
              college_name: resolvedCollegeName,
              hostel_name: hostelName || 'Hostel',
              student_roll_id: studentId || `STU-${data.user.id.slice(0, 6)}`,
            })
            .eq('profile_id', data.user.id);
        } else {
          await supabase.from('students').insert([
            {
              profile_id: data.user.id,
              college_id: resolvedCollegeId,
              mess_id: resolvedMessId,
              full_name: fullName,
              email,
              student_roll_id: studentId || `STU-${data.user.id.slice(0, 6)}`,
              college_name: resolvedCollegeName || 'Institution',
              hostel_name: hostelName || 'Hostel',
              meal_entitlement_active: true,
            },
          ]);
        }
      }

      const profileUser = await loadUserProfileFromSupabase(data.user);
      setUser(profileUser);
      return { user: profileUser };
    }
    return data;
  };

  /**
   * Links an existing student account (that has no mess_id yet) to a specific mess
   * via dropdown selection (messId) or unique Mess Join Code (joinCode).
   */
  const linkStudentToMess = async ({
    messId,
    joinCode,
    hostelName,
    studentRollId,
  }) => {
    if (!user?.id) throw new Error('You must be signed in to link a mess.');
    if (isDemoMode || !isSupabaseConfigured || !supabase) {
      const updatedDemoUser = {
        ...user,
        messId: messId || 'mess-demo-001',
        hostelName: hostelName || user.hostelName,
        studentId: studentRollId || user.studentId,
      };
      setUser(updatedDemoUser);
      return updatedDemoUser;
    }

    let targetMess = null;
    if (joinCode && joinCode.trim()) {
      const { data, error } = await supabase
        .from('messes')
        .select('*')
        .ilike('join_code', joinCode.trim())
        .limit(1)
        .maybeSingle();
      if (error || !data) {
        throw new Error(
          `No active mess found with Join Code "${joinCode.trim().toUpperCase()}". Please verify the code with your Mess Owner.`
        );
      }
      targetMess = data;
    } else if (messId) {
      const { data, error } = await supabase
        .from('messes')
        .select('*')
        .eq('id', messId)
        .maybeSingle();
      if (error || !data) {
        throw new Error('Selected mess could not be found. Please try again.');
      }
      targetMess = data;
    } else {
      throw new Error(
        'Please select a mess from the dropdown or enter a Mess Join Code.'
      );
    }

    const nextHostel = hostelName?.trim() || user.hostelName || 'Hostel';
    const nextRoll =
      studentRollId?.trim() || user.studentId || `STU-${user.id.slice(0, 6)}`;

    // 1. Update profiles.mess_id
    await supabase
      .from('profiles')
      .update({
        mess_id: targetMess.id,
        college_id: targetMess.college_id || null,
        mess_name: targetMess.name,
        college_name: targetMess.college_name,
        hostel_name: nextHostel,
        student_id_code: nextRoll,
      })
      .eq('id', user.id);

    // 2. Update or insert students.mess_id
    const { data: existingStu } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (existingStu) {
      await supabase
        .from('students')
        .update({
          mess_id: targetMess.id,
          college_id: targetMess.college_id || null,
          college_name: targetMess.college_name,
          hostel_name: nextHostel,
          student_roll_id: nextRoll,
        })
        .eq('profile_id', user.id);
    } else {
      await supabase.from('students').insert([
        {
          profile_id: user.id,
          college_id: targetMess.college_id || null,
          mess_id: targetMess.id,
          full_name: user.fullName || user.full_name || 'Student',
          email: user.email,
          student_roll_id: nextRoll,
          college_name: targetMess.college_name || 'Institution',
          hostel_name: nextHostel,
          meal_entitlement_active: true,
        },
      ]);
    }

    // 3. Also update messes.registered_students count from real students rows
    const { count: realCount } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('mess_id', targetMess.id);

    if (typeof realCount === 'number') {
      await supabase
        .from('messes')
        .update({ registered_students: realCount })
        .eq('id', targetMess.id);
    }

    const updatedUser = {
      ...user,
      messId: targetMess.id,
      collegeId: targetMess.college_id || user.collegeId,
      messName: targetMess.name,
      collegeName: targetMess.college_name || user.collegeName,
      hostelName: nextHostel,
      studentId: nextRoll,
    };
    setUser(updatedUser);
    return updatedUser;
  };

  const sendPasswordReset = async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        demoMode: true,
        message:
          'Demo Mode Active: In production with Supabase configured, a password recovery link is emailed to ' +
          email,
      };
    }

    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
    return { demoMode: false };
  };

  const updatePassword = async (newPassword) => {
    if (!isSupabaseConfigured || !supabase) {
      return { demoMode: true };
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return { demoMode: false };
  };

  const logout = async () => {
    localStorage.removeItem('smartbite_demo_session');
    localStorage.removeItem('smartbite_user');
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const isDemoMode = !isSupabaseConfigured || Boolean(user?.isDemoUser);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSupabaseConfigured,
        isDemoMode,
        login,
        loginWithDemoRole,
        register,
        linkStudentToMess,
        sendPasswordReset,
        updatePassword,
        logout,
        signOut: logout,
        getDashboardPathForRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
