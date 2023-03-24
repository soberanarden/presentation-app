import { Component, OnInit } from '@angular/core';
import pptxgen from 'pptxgenjs';
import { GetDataService } from './get-data.service';
import {
  IntermissionSlide,
  Question,
  QuestionType,
  QuestionTypeColor,
  SlideCategories,
  SlidesData,
  WelcomeSlide,
} from './interfaces/question.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public data!: SlidesData;
  public types = Object.values(QuestionType);
  public hideContent = true;
  public gameMode = false;

  private pptx = new pptxgen();

  constructor(private service: GetDataService) {
    this.pptx.defineLayout({
      name: 'CUSTOM',
      width: 10,
      height: 6,
    });
    this.pptx.layout = 'CUSTOM';
  }

  public ngOnInit(): void {
    this.service.getData().subscribe((res) => {
      this.data = res;
    });
  }

  public onSaveChanges(): void {
    this.data = this.generateSlidesData();
    this.service.saveData(this.data);
  }

  public async onGeneratePDF(): Promise<void> {
    this.onSaveChanges();
    window.print();
  }

  public onGeneratePPTX(): void {
    this.onSaveChanges();

    this.welcomeSlide(this.data.welcome);

    this.getQuestions().forEach((value) => {
      this.intermissionSlide(this.data.intermission, value.hash);
      this.questionSlide(value, this.data.intermission.pictureUrl);
    });

    this.pptx.writeFile();
  }

  private getQuestions(): Question[] {
    const { easy, medium, hard, veryHard, frenzy } = this.data;
    return [...easy, ...medium, ...hard, ...veryHard, ...frenzy];
  }

  private generateUID(): string {
    // I generate the UID from two parts here
    // to ensure the random number provide enough bits.
    const firstPart = (Math.random() * 46656) | 0;
    const secondPart = (Math.random() * 46656) | 0;
    const firstPartString = ('000' + firstPart.toString(36)).slice(-3);
    const secondPartString = ('000' + secondPart.toString(36)).slice(-3);
    return firstPartString + secondPartString;
  }

  private welcomeSlide(data: WelcomeSlide): void {
    const slide = this.slideSetup();
    slide.addText(data.title, {
      color: 'FFFFFF',
      align: 'center',
      fontSize: 100,
      w: '100%',
      h: 3,
      y: 0.5,
    });

    slide.addText(data.subTitle, {
      y: 5,
      w: '100%',
      h: 1,
      align: 'center',
      fontSize: 16,
      color: 'FFFFFF',
    });
  }

  private questionSlide(data: Question, defaultImagePath: string): void {
    const slide = this.slideSetup(data.hash);
    const levelColor = this.getLevelColor(data.type);

    // hash text
    slide.addText(data.hash as string, {
      color: 'DADADA',
      fontSize: 8,
      align: 'center',
      w: '100%',
      h: 0.5,
      y: 5.5,
    });

    // level text
    slide.addText(data.type, {
      align: 'center',
      h: 1,
      w: 4,
      color: levelColor,
      x: 3,
      y: 0,
      fontSize: 16,
    });

    // partial points text
    slide.addText(`Pkt. za 1 odp.: ${data.partialPoints}pkt.`, {
      w: 5,
      h: 1,
      align: 'left',
      fontSize: 16,
      x: 0,
      y: 0.5,
      color: 'FFFFFF',
    });

    // max points text
    const isFrenzy = data.type === QuestionType.FRENZY;
    slide.addText(
      `${isFrenzy ? 'Czas' : 'MAX pkt.'}: ${data.maxPoints}${
        isFrenzy ? 'sek.' : 'pkt.'
      }`,
      {
        w: 5,
        h: 1,
        align: 'right',
        fontSize: 16,
        x: 5,
        y: 0.5,
        color: 'FFFFFF',
      }
    );

    // question body
    slide.addText(`Pytanie:\n${data.question}`, {
      fontSize: 32,
      color: 'FFFFFF',
      align: 'center',
      w: '100%',
      h: 2,
      y: 3.5,
    });

    // image
    slide.addImage({
      path: data.imageUrl ?? defaultImagePath,
      y: 1.5,
      x: 4,
      rounding: !data.imageUrl,
      sizing: { type: 'contain', w: 2, h: 2 },
    });
  }

  private intermissionSlide(data: IntermissionSlide, hash?: string): void {
    const slide = this.slideSetup();

    slide.addImage({
      path: data.pictureUrl,
      y: 1,
      x: 3,
      rounding: true,
      sizing: { type: 'contain', w: 4, h: 4 },
    });

    slide.addText(data.title, {
      y: 5,
      w: '100%',
      h: 1,
      align: 'center',
      fontSize: 16,
      color: 'FFFFFF',
    });

    if (hash) {
      slide.addText(hash, {
        color: 'DADADA',
        fontSize: 8,
        align: 'center',
        w: '100%',
        h: 0.5,
        y: 5.5,
      });
    }
  }

  private slideSetup(hash?: string): pptxgen.Slide {
    const slide = this.pptx.addSlide();
    slide.background = { color: '000000' };
    return slide;
  }

  private getLevelColor(type: QuestionType): QuestionTypeColor {
    switch (type) {
      case QuestionType.EASY:
        return QuestionTypeColor.EASY;
      case QuestionType.MEDIUM:
        return QuestionTypeColor.MEDIUM;
      case QuestionType.HARD:
        return QuestionTypeColor.HARD;
      case QuestionType.VERY_HARD:
        return QuestionTypeColor.VERY_HARD;
      case QuestionType.FRENZY:
        return QuestionTypeColor.FRENZY;
    }
  }

  private generateSlidesData(): SlidesData {
    const questions = this.getQuestions();
    const data: SlidesData = {
      ...this.getTypedData(
        questions.map((value, index) => {
          return {
            ...value,
            hash: value.hash ?? this.generateUID() + ` - ${(index + 1) * 2}`,
          };
        })
      ),
      welcome: {
        title: 'Welcome pojebańcy XD',
        subTitle: 'Ognisko Złomowisko - Family Feud',
      },
      intermission: {
        title: 'Ognisko Złomowisko - Family Feud',
        pictureUrl: './../assets/ezgif.com-gif-maker.png',
      },
    };

    return data;
  }

  private getTypedData(data: Question[]): SlideCategories {
    const easy = data
      .map((value) => {
        if (value.type === QuestionType.EASY) {
          return value;
        }
        return;
      })
      .filter(Boolean) as Question[];

    const medium = data
      .map((value) => {
        if (value.type === QuestionType.MEDIUM) {
          return value;
        }
        return;
      })
      .filter(Boolean) as Question[];

    const hard = data
      .map((value) => {
        if (value.type === QuestionType.HARD) {
          return value;
        }
        return;
      })
      .filter(Boolean) as Question[];

    const veryHard = data
      .map((value) => {
        if (value.type === QuestionType.VERY_HARD) {
          return value;
        }
        return;
      })
      .filter(Boolean) as Question[];

    const frenzy = data
      .map((value) => {
        if (value.type === QuestionType.FRENZY) {
          return value;
        }
        return;
      })
      .filter(Boolean) as Question[];

    return { easy, medium, hard, veryHard, frenzy };
  }
}
