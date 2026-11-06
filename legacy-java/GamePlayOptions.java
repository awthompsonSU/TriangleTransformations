//Brian Lawrence and Andrew Thompson
//GamePlayOptions.java
//This file sets up the panel with all the game play options and implements them
import javax.swing.*;
import javax.swing.WindowConstants;
import java.awt.*;
import java.awt.event.*;
import javax.swing.JComboBox;

//this class containts the boxes and buttons to shoot lasers, guess baffles, check score, and cheat
public class GamePlayOptions extends JPanel{
    private JLabel labelTranslateX, labelTranslateY, labelDilate, labelReflectX, labelReflectY, labelRotate, labelDirection;                   
    private JButton buttonTranslate, buttonDilate, buttonScore, buttonReflectX, buttonReflectY, buttonRotate,buttonReset, buttonTransform;
    private baffleExtension baffle;
    private static final int FIRE_NUMBER=40, GUESS_NUMBER=10,GUESS_BAFFLE_CHOICE=2;
    private JComboBox boxDirection, boxDilate;
    private JCheckBox cheat;
    private int numberWrong; //keeps track of wrong passwords
    private String[] guess={"0","0","0"};    //string array to hold user guesses in Actionlistener
    private JFrame cheatPassword; //Frame to hold password compenent
    private JPasswordField password;         //Password to allow user to cheat(see all the baffles)
    private int guessRow,guessCol;           //used to hold conversion of user guesses of row and col
    private int xtranslate = 0, xreflect =0;
    private int ytranslate = 0, yreflect = 0;
    private int rotate = 0;
    private char guessDir;                   //used to hold conversion of user guess to char value
    private JFormattedTextField xTranslateField, xReflectField;
    private JFormattedTextField yTranslateField, yReflectField;
    private JFormattedTextField rotateField;
    private int resetCounter = 0;
    
    public GamePlayOptions(baffleExtension baf) {
        //baffle holds the baffleExtension object in which the game is run through
        baffle=baf;
        //Sets number of wrong guess to 0 for later use in cheatbox
        numberWrong=0;
        //Set up the Panel that will hold the gameplay options
        setLayout(new BoxLayout(this,BoxLayout.PAGE_AXIS));
        add(Box.createRigidArea(new Dimension(0,3)));
        this.setMaximumSize(new Dimension(200,500));
        
        String boxDirectionContents[] = {"  ", "90 Clockwise", "90 Counter-Clockwise", "180 Deg"};
        boxDirection=new JComboBox(boxDirectionContents);
        String boxDilateContents[] = {" ", "1/3", "1/2", "2", "3"};
        boxDilate = new JComboBox(boxDilateContents);
        //boxDirection.setMaximumSize(new Dimension(80,80));
        
        //Creates the labels for gameplay options
        labelTranslateX=new JLabel("Translate X:");
        labelTranslateY=new JLabel("Translate Y:");
        labelTranslateX.setToolTipText("Enter how the shape was translated");
        labelReflectX=new JLabel("Reflect over X=");
        labelReflectY=new JLabel("Reflect over Y=");
        labelRotate= new JLabel("Rotate (Degrees):");
        labelDirection = new JLabel("Direction: ");
        labelDilate = new JLabel("Dilate: ");
        
        xTranslateField = new JFormattedTextField();
        xTranslateField.setValue(new Integer(xtranslate));
        xTranslateField.setColumns(5);
        
        
        yTranslateField = new JFormattedTextField();
        yTranslateField.setValue(new Integer(ytranslate));
        yTranslateField.setColumns(5);
        
        xReflectField = new JFormattedTextField();
        xReflectField.setValue(new Integer(xreflect));
        xReflectField.setColumns(5);
        
        
        yReflectField = new JFormattedTextField();
        yReflectField.setValue(new Integer(yreflect));
        yReflectField.setColumns(5);
        
        rotateField = new JFormattedTextField();
        //rotateField.setValue(new Integer(rotate));
        rotateField.setColumns(5);
        //Set up bottons for fire, guess, quit, and score
        buttonTranslate=new JButton("Translate");
        buttonReflectX=new JButton("Reflect X");
        buttonReflectY=new JButton("Reflect Y");
        buttonRotate=new JButton("Rotate");
        buttonReset = new JButton("Reset");
        buttonTransform = new JButton("Transform");
        buttonScore = new JButton( "Score");
        buttonDilate = new JButton("Dilate");
        //if (baf.getDifficulty()==1)
        //{
          add(labelTranslateX);
        add(xTranslateField);
        add(labelTranslateY);
        add(yTranslateField);
        add(buttonTranslate);
        add(labelReflectX);
        add(xReflectField);
        add(buttonReflectX);
        add(labelReflectY);
        add(yReflectField);
        add(buttonReflectY);
        add(labelRotate);
        add(boxDirection);
        add(buttonRotate);
        //add(labelDilate);
        //add(boxDilate);
        //add(buttonDilate);
        add(buttonScore);
        add(buttonReset);
        //add(cheat);
        //}
        /*else
        {
           add(labelTranslateX);
           
           add(labelTranslateY);
           add(yTranslateField);
           
           add(labelReflectX);
           add(xReflectField);
           
           add(labelReflectY);
           add(yReflectField);
           
           add(labelRotate);
           add(boxDirection);
          add(buttonTransform);
           add(buttonScore);
        }*/
        //set up the ActionListoners
        ButtonHandler handle= new ButtonHandler();
        buttonTranslate.addActionListener(handle);
        buttonScore.addActionListener(handle);
        buttonReflectX.addActionListener(handle);
        buttonReflectY.addActionListener(handle);
        buttonRotate.addActionListener(handle);
        buttonReset.addActionListener(handle);
        buttonTransform.addActionListener(handle);
        buttonDilate.addActionListener(handle);
        
        
    }
    
 public void reset()
 {
   xTranslateField.setValue(new Integer(xtranslate));
   yTranslateField.setValue(new Integer(ytranslate));
   xReflectField.setValue(new Integer(xreflect));
   yReflectField.setValue(new Integer(yreflect));
   boxDirection.setSelectedItem("");
 }        
    //private class Actionlistener for handling butten events and the like
 private class ButtonHandler implements ActionListener
 {
  public void actionPerformed(ActionEvent event)
  {
   //handles hitting the score button
   if(event.getSource()==buttonReset)
   {
       baffle.resetShape();
       reset();
       resetCounter++;
       if (resetCounter==4)
         JOptionPane.showMessageDialog(null,"If you reset one more time, the program will close\nand you will lose all progress");
       else if (resetCounter==5)
       { 
         JOptionPane.showMessageDialog(null,"GoodBye!");
         System.exit(1);
       }
         
   }
                        //handles hitting the guess button
                        //holds the inputs of the three combo boxes into the guess array
   else if(event.getSource()==buttonReflectX)
                        {
                            int x=((Number)xReflectField.getValue()).intValue();
                            baffle.setReflectX(x);
                            baffle.guessReflectX();
                            baffle.isCorrect();
                            resetCounter=0;
                        }
   else if(event.getSource()==buttonReflectY)
                        { 
                            int y = ((Number)yReflectField.getValue()).intValue();
                            baffle.setReflectY(y);
                            baffle.guessReflectY();
                            baffle.isCorrect();
                            resetCounter=0;
                        }
                        //handles the fire button
                        //gets the value of the fire combo box and converts it to an int
   else if(event.getSource()==buttonTranslate)
                        {
                            int x=((Number)xTranslateField.getValue()).intValue();
                            baffle.setTranslateX(x);
                            int y = ((Number)yTranslateField.getValue()).intValue();
                            baffle.setTranslateY(y);
                            baffle.guessTranslate();
                            baffle.isCorrect();
                            resetCounter=0;
                        }
                        //quits the game when quit button hit
   else if(event.getSource()==buttonRotate)
                        {
                            String dir = (String)boxDirection.getSelectedItem();
                            if(dir=="  "){}
                            else
                            {
                            baffle.guessRotate(dir);
                            baffle.isCorrect();
                            resetCounter=0;
                            }
                        }
   else if(event.getSource()==buttonScore)
   {
                 int []counter = new int[4];
                 int total = 0;
                 int []score = new int[4];
                 int totalscore = 0;
                 counter = baffle.getShapeNumber();
                 score = baffle.getScore();
                 
                 for(int a = 0; a<4;a++)
                 {
                   total+=counter[a];
                   totalscore+=score[a];
                 }
                 for (int b = 0; b<4; b++)
                 {
                   if (b==baffle.getCurrent())
                   {
                      counter[b]--;
                   }
                 }
                 JOptionPane.showMessageDialog(null,"Your Current Score is:\n "+ totalscore+" correct out of "+(total-1)+" shapes.\nYou have guessed "+score[0]+" out of " + counter[0]+"Tranlsations\nYou have guessed "+score[1]+" out of " + counter[1]+"Reflections\nYou have guessed "+score[2]+" out of " + counter[2]+"Rotations\n" /*You have guessed "+score[3]+" out of " + counter[3]+"Dilations\n"*/);
                 
                 reset();
                 resetCounter=0;
   }
   else if(event.getSource()==buttonDilate)
   {
    String dil = (String)boxDilate.getSelectedItem();
    
    if (dil == "1/3")
      baffle.guessDilate(-3);
    else if (dil == "1/2")
      baffle.guessDilate(-2);
    else if (dil == "2")
      baffle.guessDilate(2);
    else if (dil == "3")
      baffle.guessDilate(3);
    if(dil != " ")
    {
      baffle.isCorrect();
      resetCounter=0;
    }
    
    
   }
    
 }
 
}
}