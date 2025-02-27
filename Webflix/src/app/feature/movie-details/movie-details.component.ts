import { Component, OnInit } from "@angular/core";
import { MovieService } from "../services/movie.service";
import { Movie } from "src/app/Types/Movie";
import { ActivatedRoute, Router } from "@angular/router";
import { ModalService } from "../services/modal.service";
import { UserService } from "../services/user.service";
import { CommentService } from "../services/comment.service";

@Component({
  selector: "app-movie-details",
  templateUrl: "./movie-details.component.html",
  styleUrls: ["./movie-details.component.css"],
})
export default class MovieDetailsComponent implements OnInit {
  comments: any;
  movie: Movie | undefined;
  movieId = this.route.snapshot.params["id"];
  isLoggedIn: boolean = false;
  isOwner: boolean = false;
  userId: string | undefined = "";

  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private modalService: ModalService,
    private userService: UserService,
    private router: Router,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.movieService.getMovie(this.movieId).subscribe((movie) => {
      this.movie = movie;
      this.comments = movie.comments;

      this.userService.user$.subscribe((user) => {
        if (user) {
          this.userId = user._id;
          this.isLoggedIn = true;
          if (this.movie?.ownerId === user?._id) {
            this.isOwner = true;
          }
        }
      });
    });
  }
  ngAfterViewInit() {
    this.commentService.getComments(this.movieId).subscribe(
      (comments) => {
        this.comments = comments;
      },
      function (error) {
        console.error("Error fetching comments", error);
      }
    );
  }

  isCommentOwner(comment: any): boolean | undefined {
    return comment.userId._id === this.userId;
  }

  getNewComment(comments: any) {
    this.comments = comments;
  }

 
  deleteHandler(): void {
    this.modalService.open();
  }

  editHandler(): void {
    this.router.navigate([`/movie-edit/${this.movieId}`], {
      state: { isOwner: this.isOwner },
    });
  }

  deleteComment(comments: any): void {
    this.commentService.deletesComment(comments._id).subscribe(
      (response) => {
        console.log("Comment deleted", response);

        this.comments = this.comments.filter(
          (comment: any) => comment._id !== comments._id
        );
      },
      (error) => {
        console.error("Error deleting comment", error);
      }
    );
  }
}
