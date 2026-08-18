import { getData } from '../store.js';
import { renderTrackerPage } from './trackerShared.js';

export function renderRecruitment(container) {
  renderTrackerPage(container, getData(), 'recruitment', { title: 'Recruitment' });
}
