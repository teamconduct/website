import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TopHeaderComponent } from '../../components/top-header/top-header.component';

@Component({
  selector: 'page-user-dashboard',
  imports: [TopHeaderComponent],
  templateUrl: './user-dashboard.page.html',
  styleUrl: './user-dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardPage {

}
