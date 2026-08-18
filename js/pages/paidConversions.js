import { getData } from '../store.js';
import { renderTrackerPage } from './trackerShared.js';

export function renderPaidConversions(container) {
  renderTrackerPage(container, getData(), 'paidConversions', { title: 'Paid Conversions' });
}
