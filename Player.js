export default class Player {
    WALK_ANIMATION_TIMER = 200;
    walkAnimationTimer = this.WALK_ANIMATION_TIMER;

    jumpPressed = false;
    jumpInProgress = false;
    falling = false;
    JUMP_SPEED = 0.6;
    GRAVITY = 0.3;

 
    constructor(ctx,width,height,minJumpHeight,maxJumpHeight, scaleRatio, standingImageSrc, runImageSrcs) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.width = width;
    this.height = height;
    this.minJumpHeight = minJumpHeight;
    this.maxJumpHeight = maxJumpHeight;
    this.scaleRatio = scaleRatio;

    this.x = 10 * scaleRatio;
    this.y = this.canvas.height - this.height - 1.5 * scaleRatio;
    this.yStandingPosition = this.y;

        // Load standing still image
        this.standingStillImage = new Image();
        this.standingStillImage.src = standingImageSrc;

        // Load run images
        this.runImages = [];
        runImageSrcs.forEach(src => {
            const img = new Image();
            img.src = src;
            this.runImages.push(img);
        });

        // Initial sprite
        this.image = this.standingStillImage;

        // Animation state
        this.isRunning = false;
        this.currentRunFrame = 0;

        //unphone
        this.unphone = this.unphone.bind(this);
        window.addEventListener('message', this.unphone)

    }
     update(gameSpeed, frameTimeDelta) {
        if (this.isRunning) {
            //console.log(this.jumpPressed);
            this.run(gameSpeed, frameTimeDelta);
            if(this.jumpInProgress){this.image = this.standingStillImage;}
            this.jump(frameTimeDelta);
        } else {
            this.image = this.standingStillImage;
        }
    }

    run(gameSpeed, frameTimeDelta) {
        if (this.walkAnimationTimer <= 0) {
            // Toggle between runImages[0] and runImages[1]
            this.currentRunFrame = (this.currentRunFrame + 1) % this.runImages.length;
            this.image = this.runImages[this.currentRunFrame];
            this.walkAnimationTimer = this.WALK_ANIMATION_TIMER;
        }
        this.walkAnimationTimer -= frameTimeDelta * gameSpeed;
    }

    setRunning(isRunning) {
        this.isRunning = isRunning;
    }
    draw() {
        this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

  unphone(event) {
    if (event.data === "jump") {
      this.jumpPressed = true;
      setTimeout(() => {
        this.jumpPressed = false;
      }, 100);
    }
  }

    jump(frameTimeDelta) {
    if (this.jumpPressed) {
      this.jumpInProgress = true;
    }

    if (this.jumpInProgress && !this.falling) {
      if (
        this.y > this.canvas.height - this.minJumpHeight ||
        (this.y > this.canvas.height - this.maxJumpHeight && this.jumpPressed)
      ) {
        this.y -= this.JUMP_SPEED * frameTimeDelta * this.scaleRatio;
      } else {
        this.falling = true;
      }
    } else {
      if (this.y < this.yStandingPosition) {
        this.y += this.GRAVITY * frameTimeDelta * this.scaleRatio;
        if (this.y + this.height > this.canvas.height) {
          this.y = this.yStandingPosition;
        }
      } else {
        this.falling = false;
        this.jumpInProgress = false;
        this.jumpPressed = false;
      }
    }
  }
}