import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appNoRightClickDirective]'
})
export class NoRightClickDirectiveDirective {
  @Output() ctrlV = new EventEmitter();
  @Output() ctrlC = new EventEmitter();


  @HostListener('contextmenu', ['$event'])
  onRightClick(event){
    event.preventDefault();
  }



  @HostListener('keydown.control.v') onCtrlV() {
    this.ctrlV.emit();
  }

  @HostListener('keydown.control.c') onCtrlC() {
    this.ctrlC.emit();
  }

  constructor() { }

}
