import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  AfterViewInit,
  OnChanges
} from '@angular/core';
import { fromEvent, from, of, range, zip } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import {
  debounceTime,
  distinctUntilChanged,
  pluck,
  distinct,
  map,
  tap,
  toArray,
  filter,
  groupBy,
  mergeMap,
  reduce,
  take,
  switchMap,
} from 'rxjs/operators'


@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput', { static: true }) input: ElementRef;
  @ViewChild('selectInput', { static: true }) select: ElementRef;

  public users = [];
  public types = [];
  public arr;
  public data;

  constructor() {
    this.arr = range(1, 200);
  }

  ngOnInit() {
    // Câu 1
    from(this.arr).pipe(
      filter((x: number) => x % 2 === 0),
      toArray()
    ).subscribe(arr => console.log('Cau 1:', arr));

    // Câu 2
    console.log('Cau 2:');
    from(this.arr).pipe(
      groupBy((x: number) => x % 2 === 0),
      mergeMap(group => group.pipe(toArray()))
    ).subscribe(arr => console.log(arr));

    // Câu 3
    console.log('Cau 3:');
    from(this.arr).pipe(
      reduce((total: number, number: number) => total + number, 0)
    ).subscribe(total => console.log(total));

    // Câu 4
    console.log('Cau 4:');
    from(this.arr).pipe(
      take(50),
      toArray()
    ).subscribe(arr => console.log(arr));

    // Câu 5
    console.log('Cau 5:');
    from(this.arr).pipe(
      filter(x => x < 50),
      toArray()
    ).subscribe(arr => console.log(arr));

    // Câu 6
    console.log('Cau 6:');
    let char = of<string>('a', 'b', 'c');
    let number = of<number>(1, 2, 3);
    zip(char, number).pipe(
      map(([char, number]) => char + number),
      toArray()
    ).subscribe(arr => console.log(arr));

    // Câu 7
    console.log('Cau 7:');
    const data$ = fromFetch(`https://api.github.com/users?per_page=100`).pipe(
      switchMap(response => {
        if (response.ok) {
          return response.json();
        } else {
          return of({ error: true, message: `Error ${response.status}` });
        }
      }),
      map(data => {
        return data.map(({ login, type, avatar_url }) => {
          return {
            name: login,
            type,
            avatar: avatar_url
          }
        })
      })
    ).subscribe(async arr => {
      console.log(arr);
      this.data = arr;
      this.users = arr.filter(x => x.type === 'User');
      this.types = await from(this.data).pipe(
        distinct(x => x.type),
        map(item => item.type),
        toArray()
      ).toPromise();
    });

  }

  ngAfterViewInit() {
    fromEvent(this.input.nativeElement, 'keyup').pipe(
      pluck('target', 'value'),
      debounceTime(500),
      map(key => this.data.filter(item => item.name.indexOf(key) > -1)),
    ).subscribe(res => this.users = res);

  }

  

}