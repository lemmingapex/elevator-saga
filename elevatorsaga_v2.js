{
  init: function(elevators, floors) {
    const groundFloor = 0;
    // total number of floors in the building
    const topFloor = floors.length - 1;
    // only stop the elevator on passing floors if the loadFactor is below this threshold
    const passingLoadFactorThreshold = 0.7;
    // array of floorNumbers that have the up button pressed, ordered when they were pressed
    let floorsGoingUp = [];
    // array of floorNumbers that have the down button pressed, ordered when they were pressed
    let floorsGoingDown = [];

    // floor logic
    floors.forEach((floor) => {
      floor.on("up_button_pressed", () => {
        floorsGoingUp.push(floor.floorNum());
      });
      floor.on("down_button_pressed", () => {
        floorsGoingDown.push(floor.floorNum());
      });
    });

    // elevator logic
    elevators.forEach((elevator, i) => {
      elevator.on("idle", () => {
        if (floorsGoingDown.length > 0) {
          elevator.goingUpIndicator(false);
          elevator.goingDownIndicator(true);
          const maxGoingDown = Math.max(...floorsGoingDown);
          floorsGoingDown = floorsGoingDown.filter((f) => {
            return f != maxGoingDown;
          });
          elevator.goToFloor(maxGoingDown);
        } else if (floorsGoingUp.length > 0) {
          elevator.goingUpIndicator(true);
          elevator.goingDownIndicator(false);
          elevator.goToFloor(floorsGoingUp.shift());
        } else {
          elevator.goingUpIndicator(true);
          elevator.goingDownIndicator(true);
        }
      });

      elevator.on("passing_floor", (floorNum, direction) => {
        console.log("elevator " + i + " passing_floor " + floorNum + " going " + direction + " with loadFactor: " + elevator.loadFactor() + " and destinationQueue: " + elevator.destinationQueue);
        if (elevator.loadFactor() < passingLoadFactorThreshold) {
          if (direction === "up") { // if the elevation is going up
            if (floorsGoingUp.indexOf(floorNum) > -1) {
              floorsGoingUp = floorsGoingUp.filter((f) => {
                return f != floorNum;
              });
              elevator.goToFloor(floorNum, true);
            }
          } else { // elevator is going down
            if (floorsGoingDown.indexOf(floorNum) > -1) {
              floorsGoingDown = floorsGoingDown.filter((f) => {
                return f != floorNum;
              });
              elevator.goToFloor(floorNum, true);
            }
          }
        }
      });

      elevator.on("floor_button_pressed", (floorNum) => {
        if (elevator.destinationQueue.indexOf(floorNum) == -1) {
          elevator.destinationQueue.push(floorNum);
        }
        // if the elevator is going up, sort ascending
        if (elevator.goingUpIndicator() && !elevator.goingDownIndicator()) {
          elevator.destinationQueue.sort((a, b) => {
            return a - b;
          });
        } else if (!elevator.goingUpIndicator() && elevator.goingDownIndicator()) { // else if the elevator is going up, sort descending
          elevator.destinationQueue.sort((a, b) => {
            return b - a;
          });
        } else { // elevator is idle
          if (elevator.destinationQueue[0] > elevator.currentFloor()) {
            elevator.goingUpIndicator(true);
            elevator.goingDownIndicator(false);
          } else {
            elevator.goingUpIndicator(false);
            elevator.goingDownIndicator(true);
          }
        }
        elevator.checkDestinationQueue();
      });

      // if the elevator is at the ground floor or top floor, we need to set the lights correctly
      elevator.on("stopped_at_floor", (floorNum) => {
        if (floorNum == groundFloor) {
          elevator.goingUpIndicator(true);
          elevator.goingDownIndicator(false);
        } else if (floorNum == topFloor) {
          elevator.goingUpIndicator(false);
          elevator.goingDownIndicator(true);
        }
      });

    });
  },
  update: function(dt, elevators, floors) {
    // We normally don't need to do anything here
  }
}
