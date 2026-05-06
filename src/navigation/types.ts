/**
 * Type definitions for React Navigation
 */

export type RootTabParamList = {
  ExploreTab: undefined;
  DashboardTab: undefined;
  TimerTab: { skillId?: string };
  ProfileTab: undefined;
};

export type ExploreStackParamList = {
  Explore: undefined;
  Search: undefined;
  SkillDetail: { skill: any }; // SkillMaster type
  Assessment: { skill: any };
  Result: { userSkillId: string };
  Quiz: { skillId: string };
  GlobalAssessment: undefined;
  Onboarding: undefined;
};

export type DashboardStackParamList = {
  GlobalDashboard: undefined;
  SkillDashboard: { skillId: string };
};

export type TimerStackParamList = {
  Timer: { skillId?: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
};
