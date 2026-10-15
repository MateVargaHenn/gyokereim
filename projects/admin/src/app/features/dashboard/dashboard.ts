import {
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EMPTY, expand, finalize, map, reduce } from 'rxjs';

import { OrdersService } from '../../core/services/orders.service';
import { ServicesService } from '../../core/services/services.service';
import { BlogService } from '../../core/services/blog.service';

import { AdminOrderItemDto } from '../../shared/data-transfer-objects/admin-order-item.dto';
import { AdminServiceDto } from '../../shared/data-transfer-objects/admin-service.dto';
import { AdminPostItemDto } from '../../shared/data-transfer-objects/admin-post-item.dto';

import { OrderStatusCode } from '../../shared/enums/order-status-code';
import { ServiceStatusCode } from '../../shared/enums/service-status-code';
import { PostStatus } from '../../shared/enums/post-status';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly ordersService = inject(OrdersService);
  private readonly servicesService = inject(ServicesService);
  private readonly blogService = inject(BlogService);
  private readonly destroyRef = inject(DestroyRef);

  readonly orders = signal<AdminOrderItemDto[]>([]);
  readonly services = signal<AdminServiceDto[]>([]);
  readonly posts = signal<AdminPostItemDto[]>([]);

  readonly ordersLoading = signal(false);
  readonly servicesLoading = signal(false);
  readonly postsLoading = signal(false);

  readonly ordersError = signal<string | null>(null);
  readonly servicesError = signal<string | null>(null);
  readonly postsError = signal<string | null>(null);

  readonly newOrdersCount = computed(() =>
    this.orders().filter(
      x => x.orderStatusCode === OrderStatusCode.Created
    ).length
  );

  readonly inProgressOrdersCount = computed(() =>
    this.orders().filter(
      x => x.orderStatusCode === OrderStatusCode.InProgress
    ).length
  );

  readonly servicesCount = computed(() =>
    this.services().filter(
      x => x.serviceStatusCode === ServiceStatusCode.Active
    ).length
  );

  readonly draftPostsCount = computed(() =>
    this.posts().filter(
      x => x.postStatus === PostStatus.Draft
    ).length
  );

  readonly recentOrders = computed(() =>
    [...this.orders()]
      .sort((a, b) => Date.parse(b.created) - Date.parse(a.created))
      .slice(0, 5)
  );

  readonly recentPosts = computed(() =>
    [...this.posts()]
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      .slice(0, 5)
  );

  readonly orderStatusLabels: Record<OrderStatusCode, string> = {
    [OrderStatusCode.Created]: 'Új',
    [OrderStatusCode.Consultation]: 'Konzultáció',
    [OrderStatusCode.InProgress]: 'Folyamatban',
    [OrderStatusCode.Completed]: 'Befejezett',
    [OrderStatusCode.Storno]: 'Sztornózott',
  };

  readonly postStatusLabels: Record<PostStatus, string> = {
    [PostStatus.None]: 'Nincs megadva',
    [PostStatus.Draft]: 'Piszkozat',
    [PostStatus.Published]: 'Publikált',
    [PostStatus.Archived]: 'Archivált',
  };

  constructor() {
    this.loadOrders();
    this.loadServices();
    this.loadPosts();
  }

  loadOrders(): void {
    if (this.ordersLoading()) return;

    this.ordersLoading.set(true);
    this.ordersError.set(null);

    this.ordersService.getOrders()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.ordersLoading.set(false))
      )
      .subscribe({
        next: orders => this.orders.set(orders),
        error: () => this.ordersError.set(
          'A megrendeléseket nem sikerült betölteni.'
        ),
      });
  }

  loadServices(): void {
    if (this.servicesLoading()) return;

    this.servicesLoading.set(true);
    this.servicesError.set(null);

    this.servicesService.getAdminServices()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.servicesLoading.set(false))
      )
      .subscribe({
        next: services => this.services.set(services),
        error: () => this.servicesError.set(
          'A szolgáltatásokat nem sikerült betölteni.'
        ),
      });
  }

  loadPosts(): void {
    if (this.postsLoading()) return;

    this.postsLoading.set(true);
    this.postsError.set(null);

    this.blogService.getPosts(1)
      .pipe(
        expand(page =>
          page.page < page.totalPages
            ? this.blogService.getPosts(page.page + 1)
            : EMPTY
        ),
        map(page => page.items),
        reduce(
          (allPosts, items) => allPosts.concat(items),
          [] as AdminPostItemDto[]
        ),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.postsLoading.set(false))
      )
      .subscribe({
        next: posts => this.posts.set(posts),
        error: () => this.postsError.set(
          'A blogbejegyzéseket nem sikerült betölteni.'
        ),
      });
  }
}