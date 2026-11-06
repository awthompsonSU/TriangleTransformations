//Brian Lawrence and Andrew Thompson
//baffles.java
//This file sets up a super class for containing our baffles
import javax.swing.JOptionPane;
import java.awt.Graphics;
import javax.swing.JPanel;
import javax.swing.*;
import java.awt.Color;

//this class allows the user to pick their difficulty level, then it assigns the baffles and paints the grids
public class baffles extends JPanel
{
    protected char[][] grid = new char[15][15];
    protected char[][] userGrid = new char[15][15];
    protected char[][] guessed = new char[15][15];
    protected int[][] shape1 = new int[3][2];
    protected int[][] shapeI = new int[3][2];
    protected int[][] shape2 = new int[3][2];
    protected int[][] shapeG = new int[3][2];
    protected int[][] shapeGI = new int[3][2];
    protected int numberOfBaffles;
    protected int lasers;
    protected int guesses;
    protected int score;
    protected int correctGuesses;
    protected boolean showAllBaffles;
    protected int xtranslate, xreflect;
    protected int ytranslate, yreflect;
    protected int transformType=0;
    protected int guessedType = 0;
    protected int reflectionType;
    protected int rotationType;
    protected int transformationCounter = 0;
    protected int guessCounter = 0;
    protected int numberWrong=0;
    protected int level2guess =0;
    protected int[] shapeCounter = new int[4];
    protected int[] scoreCounter = new int[4];
    protected int growShrink = 0;
    protected int dilationRemainder = 0;
    protected int guessRemainder = 0;
    
    public baffles()
    {
        //JOptionPane.showMessageDialog(null,"Welcome to Baffles!!!");
        //numberOfBaffles = 0;
        lasers = 0;
        guesses = 0;
        score = 0;
        correctGuesses = 0;
        
        for(int x = 0;x < 15;x++)
        {
            for(int y = 0;y < 15; y++)
            {
                grid[x][y] = ' ';
                userGrid[x][y] = ' ';
                guessed[x][y] = ' ';
            }
        }
    }

    public void paintComponent(Graphics g)  //This function paints the grid, baffles, and missed baffles
 {
  super.paintComponent(g);
               
  int width = 100;
  int height = 100;
                               
                int xstart = 50;
                int ystart = 50;
                
                // This loop creates the grid lines
                for(int i = 0; i < 31;i++)
                {
                    g.drawLine(xstart,50,xstart,650);
                    g.drawLine(50,ystart,650,ystart);
                    if(i==15)
                    {
                      g.drawLine(xstart-1,50,xstart-1,650);
                      g.drawLine(xstart+1,50,xstart+1,650);
                      g.drawLine(50,ystart-1,650,ystart-1);
                      g.drawLine(50,ystart+1,650,ystart+1);
                    }
                    xstart += 20;
                    ystart += 20;                   
                }
                

//               // Integer.valueOf(string1).intValue(); 
//               // String.valueof(integer);
               
                int number = 15;
                String string1 = "15";       // to print 0 - 9
                String string2 = "-15";      // to print 10 - 19
                String string3 = "20";      // to print 20 - 29
                String string4 = "39";      // to print 30 - 39
                
                int x=45;
                int y=55;
                
                // This loop prints numbers around the grid
                for(int i = 0; i < 7; i++)
                {
                    g.drawString(string1,15,y);
                    g.drawString(string2,x,25);
                    //g.drawString(string3,575,y);
                    //g.drawString(string4,x,575);
                            
                    number-=5;
                    string1 = String.valueOf(number);
                    string2 = String.valueOf(-number);
                    string3 = String.valueOf(29 - number);
                    string4 = String.valueOf(30 + number);
                    y += 100;
                    x += 100;                              
                }
               //createShape();
               g.setColor(Color.BLACK);
                 //JOptionPane.showMessageDialog(null,"Welcome to Baffles!!!");
               for (int i = 0; i<3; i++)
               {
                 int a =(15+(shape1[i][0]))*20+50;
                 int b =(-15+(shape1[i][1]))*-20+50;
                 g.fillRect(a-5,b-5,10,10);
                //System.out.println(shape1[i][0]+"\t"+shape1[i][1]);
                 //g.drawString(""+a +"  "+b,75+75*i,125+50*i);
                
               }
               int e=0, f=0;
               for (int j = 0; j<2; j++)
               {
                 int c=(15+shape1[j][0])*20+50;
                 int d = (-15+shape1[j][1])*-20+50;
                 e=(15+shape1[j+1][0])*20+50;
                 f = (-15+shape1[j+1][1])*-20+50;
                 g.drawLine(c,d,e,f);
                 g.drawLine(c+1,d+1,e+1,f+1);
                 g.drawLine(c-1,d-1,e-1,f-1);
               }
                 g.drawLine(e,f,(15+shape1[0][0])*20+50,(-15+shape1[0][1])*-20+50);
                 g.drawLine(e+1,f+1,(15+shape1[0][0])*20+50+1,(-15+shape1[0][1])*-20+50+1);
                 g.drawLine(e-1,f-1,(15+shape1[0][0])*20+49,(-15+shape1[0][1])*-20+49);
                 
               g.setColor(Color.RED);  
               for (int i = 0; i<3; i++)
               {
                 int a =(15+shape2[i][0])*20+50;
                 int b =(-15+shape2[i][1])*-20+50;
                 g.fillRect(a-5,b-5,10,10);
                //System.out.println(shape2[i][0]+"\t"+shape2[i][1]);
                 //g.drawString(""+a +"  "+b,75+75*i,125+50*i);
                
               }
               e=0;
               f=0;
               for (int j = 0; j<2; j++)
               {
                 int c=(15+shape2[j][0])*20+50;
                 int d = (-15+shape2[j][1])*-20+50;
                 e=(15+shape2[j+1][0])*20+50;
                 f = (-15+shape2[j+1][1])*-20+50;
                 g.drawLine(c,d,e,f);
                 g.drawLine(c+1,d+1,e+1,f+1);
                 g.drawLine(c-1,d-1,e-1,f-1);
               }
                 g.drawLine(e,f,(15+shape2[0][0])*20+50,(-15+shape2[0][1])*-20+50);
                 g.drawLine(e+1,f+1,(15+shape2[0][0])*20+50+1,(-15+shape2[0][1])*-20+50+1);
                 g.drawLine(e-1,f-1,(15+shape2[0][0])*20+49,(-15+shape2[0][1])*-20+49);
                 
                if (guessedType !=0)
                { g.setColor(Color.GREEN);
                for (int i = 0; i<3; i++)
               {
                 int a =(15+shapeG[i][0])*20+50;
                 int b =(-15+shapeG[i][1])*-20+50;
                 g.fillRect(a-5,b-5,10,10);
                //System.out.println(shapeG[i][0]+"\t"+shapeG[i][1]);
                 //g.drawString(""+a +"  "+b,75+75*i,125+50*i);
                
               }
               e=0;
               f=0;
               for (int j = 0; j<2; j++)
               {
                 int c=(15+shapeG[j][0])*20+50;
                 int d = (-15+shapeG[j][1])*-20+50;
                 e=(15+shapeG[j+1][0])*20+50;
                 f = (-15+shapeG[j+1][1])*-20+50;
                 g.drawLine(c,d,e,f);
                 g.drawLine(c+1,d+1,e+1,f+1);
                 g.drawLine(c-1,d-1,e-1,f-1);
               }
                g.drawLine(e,f,(15+shapeG[0][0])*20+50,(-15+shapeG[0][1])*-20+50);
                g.drawLine(e+1,f+1,(15+shapeG[0][0])*20+50+1,(-15+shapeG[0][1])*-20+50+1);
                g.drawLine(e-1,f-1,(15+shapeG[0][0])*20+49,(-15+shapeG[0][1])*-20+49);
                }
    }
    public void createShape()     //this function creates the baffles int he grid
    {
                int num =1;
                int row = (int) (Math.random() * 15);  //generates row
                int col = (int) (Math.random() * 15);  //generates column
                int xsign = (int) (Math.random() * 2); //generates direction of baffle
                int ysign = (int) (Math.random() * 2); //generates direction of baffle
                
                int xdirection;
                int ydirection;
                
                if(xsign == 0)
                        xdirection = 1;
                else
                        xdirection = -1;
                if(ysign == 0)
                        ydirection = 1;
                else
                        ydirection = -1;
                shape1[0][0]=row*xdirection;
                shape1[0][1]=col*ydirection;
        
      while (num<3)
        {
                row = (int) (Math.random() * 15);  //generates row
                col = (int) (Math.random() * 15);  //generates column
                xsign = (int) (Math.random() * 2); //generates direction of baffle
                ysign = (int) (Math.random() * 2); //generates direction of baffle
                boolean test = false;
                                
                if(xsign == 0)
                        xdirection = 1;
                else
                        xdirection = -1;
                if(ysign == 0)
                        ydirection = 1;
                else
                        ydirection = -1;

                for(int i=0; i<num; i++)
                {
                    test = checkDistance(shape1[i][0],shape1[i][1],row*xdirection,col*ydirection);
                    if(test == false)
                      break;
                }
                
                if (test == true)
                {
                  shape1[num][0]=row*xdirection;
                  shape1[num][1]=col*ydirection;
                  //g.drawString("I Got here",75+num,75+num);
                  num++;
                  test=false;
                 
                }
                
        }
        
        transformationCounter=0;
      //System.out.println("I almost made a shape");
    }
    private boolean checkDistance(int x1, int y1, int x2, int y2)
    {
      if (Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)) < 15 && Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)) !=0)
         return true;
      else 
         return false;
   }
    public void transformShape()
    {
      //System.out.print(numberOfBaffles);
      //if (numberOfBaffles == 1)
      //{  
      int transformTemp=0;
      
      if (transformationCounter == 0)
      {
         for (int f = 0; f<3; f++)
         {
           for(int g=0; g<2; g++)
           {
             shapeI[f][g]=shape1[f][g];
           }
         }
      }
      else
      {
        for (int f = 0; f<3; f++)
         {
           for(int g=0; g<2; g++)
           {
             shapeI[f][g]=shape2[f][g];
           }
         }
        transformTemp=transformType;
      }
        do {
           transformType=(int) (Math.random() * 4); 
           dilationRemainder = 0;
       // System.out.println(transformType);
        switch(transformType)
        {
          case 1: translate();
          //System.out.print("Translate");
                  break;
          case 2: reflect();
          //System.out.print("Reflect");
          break;
          case 3: rotate();
          //System.out.print("Rotate");
                  break;
          //case 4: dilate();
          //System.out.print("Dilate");
          //System.out.println(dilationRemainder);
          //       break;
          default: break;
        }
        }while(transformType==transformTemp||transformType==0/*||dilationRemainder==1*/);
        //System.out.println("I made it past switch");
      //}
        shapeCounter[transformType-1]++;
        transformationCounter++;
         System.out.println("Shape #"+transformationCounter);
    }
    private void translate()
    {
         int xshift, yshift, xdir, ydir;
         boolean check = true;
         
         do {
         check = true;
         xshift = (int) (Math.random() * 15);
         yshift = (int) (Math.random() * 15);
         xdir = (int) (Math.random() * 2);
         ydir = (int) (Math.random() * 2);
         if (xdir ==0)
           xshift*=-1;
         if (ydir ==0)
           yshift*=-1;
         for (int i = 0; i<3; i++)
         {
            if (shapeI[i][0]+xshift <-15 || shapeI[i][0]+xshift>15)
                check = false;
            else if (shapeI[i][1]+yshift <-15 || shapeI[i][1]+yshift>15)
                check = false;
            //System.out.println("stuck?");
         }
         } while (check == false);
         
         for(int j=0;j<3;j++)
         {
           shape2[j][0]=shapeI[j][0]+xshift;
           shape2[j][1]=shapeI[j][1]+yshift;
         }
         //System.out.println("I finished translating");
    }
    
    public void guessTranslate()
    {
       guessedType = 1;
       if (guessCounter == 0||numberOfBaffles==1)
      {
         for (int f = 0; f<3; f++)
         {
           for(int g=0; g<2; g++)
           {
             shapeGI[f][g]=shape1[f][g];
           }
         }
      }
      else
      {
        for (int f = 0; f<3; f++)
         {
           for(int g=0; g<2; g++)
           {
             shapeGI[f][g]=shapeG[f][g];
           }
         }
      }

//System.out.println(xtranslate + "\t"+ytranslate);
       for (int i = 0; i<3; i++)
       {
              shapeG[i][0]=xtranslate+shapeGI[i][0];
              shapeG[i][1]=ytranslate+shapeGI[i][1];
       }
       guessCounter++;
    }
    
    public void dilate()
    {
      int dilationFactor = 0;
      int growShrink = 0;
      dilationRemainder = 0;
      boolean check = true;
        
        dilationFactor = (int) (Math.random()*2);
        
        switch (dilationFactor)
        {
          case 0:
            dilationFactor=2;
            break;
          case 1:
            dilationFactor=3;
            break;
          default:
            break;
        }
        
        for (int i=0; i<3; i++)
        {
          for (int j = 0; j<2; j++)
          {
            if ((shapeI[i][j]*dilationFactor )> 15||(shapeI[i][j]*dilationFactor<-15))
               check = false;
          }
        }
        
        if (check == false)
        {
          for (int a=0;a<3;a++)
          {
            for (int b = 0; b<2; b++)
            {
               shape2[a][b]=shapeI[a][b]/dilationFactor;
               if(shapeI[a][b]%dilationFactor!=0)
                 dilationRemainder=1;
            }
          }
        }
        else
        {   for (int a=0;a<3;a++)
          {
            for (int b = 0; b<2; b++)
            {
               shape2[a][b]=shapeI[a][b]*dilationFactor;
            }
          }
        } 
        

     
     }
     
  
   public void guessDilate(int factor)
   {
       guessedType = 4;
       if (guessCounter == 0||numberOfBaffles==1)
      {
         for (int f = 0; f<3; f++)
         {
           for(int g=0; g<2; g++)
           {
             shapeGI[f][g]=shape1[f][g];
           }
         }
      }
      else
      {
        for (int f = 0; f<3; f++)
         {
           for(int g=0; g<2; g++)
           {
             shapeGI[f][g]=shapeG[f][g];
           }
         }
      }
       for (int a = 0; a<3; a++)
          {
          for (int b = 0; b<2; b++)
          {
            if(factor > 0)
              shapeG[a][b] = shapeGI[a][b]*factor;
            else 
              shapeG[a][b] = shapeGI[a][b]/(factor*-1);
          }
     }
      guessCounter++; 
  }
      
     
    private void reflect() {
      
      int reflection, posneg, distance;
      reflectionType =(int) (Math.random() * 2);
      reflection = (int) (Math.random() * 3);
      posneg = (int) (Math.random() * 2);
      if (posneg==0)
        reflection*=-1;
      switch (reflectionType)
      {
        case 0: 
          for(int i=0;i<3;i++)
        {   
            shape2[i][0]=shapeI[i][0];
            distance = Math.abs(shapeI[i][1]-reflection);
            if (shapeI[i][1]>reflection)
              shape2[i][1]=reflection - distance;
            else
              shape2[i][1]=reflection + distance;
        }
          break;
          case 1: 
          for(int i=0;i<3;i++)
        {   
            shape2[i][1]=shapeI[i][1];
            distance = Math.abs(shapeI[i][0]-reflection);
            if (shapeI[i][0]>reflection)
              shape2[i][0]=reflection - distance;
            else
              shape2[i][0]=reflection + distance;
        }
          break;
        default: break;
          
    }
    }
   public void guessReflectY()
    {
       System.out.println(guessCounter +"\t"+numberOfBaffles);
       guessedType = 2;
       int dis = 0;
        if (guessCounter == 0||numberOfBaffles==1)
      {
         for (int f = 0; f<3; f++)
         {
           for(int g=0; g<2; g++)
           {
             shapeGI[f][g]=shape1[f][g];
           }
         }
      }
      else
      {
        for (int f = 0; f<3; f++)
         {
           for(int g=0; g<2; g++)
           {
             shapeGI[f][g]=shapeG[f][g];
           }
         }
      }
       for(int i=0;i<3;i++)
        {   
            shapeG[i][0]=shapeGI[i][0];
            dis = Math.abs(shapeGI[i][1]-yreflect);
            if (shapeGI[i][1]>yreflect)
              shapeG[i][1]=yreflect - dis;
            else
              shapeG[i][1]=yreflect + dis;
        }
       guessCounter++;
    }
      public void guessReflectX()
    {
       guessedType = 2;
       int dis = 0;
        if (guessCounter == 0||numberOfBaffles==1)
      {
         for (int f = 0; f<3; f++)
         {
           for(int g=0; g<2; g++)
           {
             shapeGI[f][g]=shape1[f][g];
           }
         }
      }
      else
      {
        for (int f = 0; f<3; f++)
         {
           for(int g=0; g<2; g++)
           {
             shapeGI[f][g]=shapeG[f][g];
           }
         }
      }
       for(int i=0;i<3;i++)
        {   
            shapeG[i][1]=shapeGI[i][1];
            dis = Math.abs(shapeGI[i][0]-xreflect);
            if (shapeGI[i][0]>xreflect)
              shapeG[i][0]=xreflect - dis;
            else
              shapeG[i][0]=xreflect + dis;
        }
       guessCounter++;
    }
    
    
    private void rotate() {
    
      rotationType =(int) (Math.random() * 3);
      int direction =(int) (Math.random() * 2);
      
      switch(rotationType)
      {
        case 0:
          for (int i =0;i<3;i++)
        {
          shape2[i][0]=-shapeI[i][1];
          shape2[i][1]=shapeI[i][0];
        }
          break;
        case 1:
          for (int j=0;j<3;j++)
        {
          shape2[j][0]=-shapeI[j][0];
          shape2[j][1]=-shapeI[j][1];
        }
        case 2:
          for (int k=0;k<3;k++)
        {
          shape2[k][0]=shapeI[k][1];
          shape2[k][1]=-shapeI[k][0];
        }
          break;
      }
    //System.out.println("I finished rotating");
    }
    public void guessRotate(String dir)
    {
      
      guessedType = 3;
      
       if (guessCounter == 0||numberOfBaffles==1)
      {
         for (int f = 0; f<3; f++)
         {
           for(int g=0; g<2; g++)
           {
             shapeGI[f][g]=shape1[f][g];
           }
         }
      }
      else
      {
        for (int f = 0; f<3; f++)
         {
           for(int g=0; g<2; g++)
           {
             shapeGI[f][g]=shapeG[f][g];
           }
         }
      }
     if( dir=="90 Counter-Clockwise")
     {     for (int i =0;i<3;i++)
        {
          shapeG[i][0]=-shapeGI[i][1];
          shapeG[i][1]=shapeGI[i][0];
        }
       //System.out.println("I tried 90 cw");
     }    
     else if(dir== "180 Deg")
     {     for (int j=0;j<3;j++)
        {
          shapeG[j][0]=-shapeGI[j][0];
          shapeG[j][1]=-shapeGI[j][1];
        }
     //System.out.println("I tried 180 cw");
     }
     else if(dir=="90 Clockwise")
     {     for (int k=0;k<3;k++)
        {
          shapeG[k][0]=shapeGI[k][1];
          shapeG[k][1]=-shapeGI[k][0];
        }
     //System.out.println("I tried 90 ccw");
     }
          guessCounter++;
      }  
    public void findDifficulty()        //this function lets the user pick the level of difficulty
    {
        char difficulty[];
        while(numberOfBaffles != 1 && numberOfBaffles != 2)
        {
            String level = JOptionPane.showInputDialog("Select your level of difficulty:\n" +
                    "b - beginner (1 Transformation)\n" +
                    "a - advanced (2 Transformations)");
            difficulty = level.toCharArray();            

            if(difficulty[0] == 'b' || difficulty[0] == 'B')
                numberOfBaffles = 1;
            else if(difficulty[0] == 'a' || difficulty[0] == 'A')
                numberOfBaffles = 2;
            else
                JOptionPane.showMessageDialog(null,"*** Invalid Input ***");
            //System.out.print(numberOfBaffles);
        }    
    }
    public int getDifficulty()
    {
      return numberOfBaffles;
    }
    public void isCorrect()
    {
        repaint();
              
       boolean checkCorrect = true;
        for (int i =0;i<3;i++)
        {
          for(int j=0; j<2;j++)
          {
            if(shapeG[i][j]!=shape2[i][j])
              checkCorrect = false;
          }
        }
        if(checkCorrect)
        {
          JOptionPane.showMessageDialog(null,"You Guessed Correctly! Good Job!");
          scoreCounter[transformType-1]++;
          resetShape();

        }
        else if (numberWrong==5)
          {              
            JOptionPane.showMessageDialog(null,"You missed 5 times, try a new shape.");
            resetShape();
          }
        else if(numberOfBaffles == 1)
        {
          
          JOptionPane.showMessageDialog(null,"Incorrect Transformation. Try again!");
          numberWrong++;
          
          
        }
        else if(numberOfBaffles ==2)
        {
          if (level2guess==0)
          {
            JOptionPane.showMessageDialog(null,"Enter the second Transformation");
            level2guess++;
          }
          else 
          {
             JOptionPane.showMessageDialog(null,"Incorrect Transfromations. Try again!");
             numberWrong++;
             guessedType=0;
             guessCounter=0;
             level2guess=0;
             repaint();
          }
        }
        //if(score!=0&&score%10==0)
        //     JOptionPane.showMessageDialog(null,"You are doing great!  You have solved "+score+" transformations!");
        
        guessedType = 0;
    }
public void setTranslateX(int x)
    {
      xtranslate = x;
    }
    public void setTranslateY(int y)
    {  ytranslate = y;
    }
    public void setReflectX(int x)
    {
       xreflect=x;
    }
    public void setReflectY(int y)
    {
      yreflect = y;
    }
     public void resetShape()        //this function is for the game button. It will reset all variables to 0, allow
    {                               //the user to change difficulty, and reassign new baffles.
         //numberOfBaffles = 0;
         
         lasers = 0;
         guesses = 0;
         correctGuesses = 0;
         transformType = 0;
         guessCounter = 0;
         numberWrong=0;
         level2guess=0;

         dilationRemainder=0;
         //System.out.println("I'm trying to create shape");
         createShape();
         transformShape();
         if (getDifficulty()==2)
         {   transformShape();

         }
         //System.out.println("I did create a shape");
         
         repaint();
    }
    public int[] getShapeNumber()
    {
      return shapeCounter;
    }
    
    public int[] getScore()
    {
      return scoreCounter;
    }
    public int getCurrent()
    {
      return transformType-1;
    }
}

