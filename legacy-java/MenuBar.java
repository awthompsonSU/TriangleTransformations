//Brian Lawrence and Andrew Thompson
//MenuBar.java
//This file sets up the MenuBar for our game
import javax.swing.JOptionPane;
import java.awt.Graphics;
import javax.swing.JPanel;
import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import javax.swing.JFrame;


public class MenuBar extends JMenuBar{
            private JMenu menu;
            private JMenuItem menuItem_New, menuItem_Help, menuItem_Quit;
            private baffleExtension baffle;
            private JFrame application;
     public MenuBar(baffleExtension baf, JFrame app)
        {
            MenuHandler handler=new MenuHandler();
            baffle=baf;
            application=app;
            menu=new JMenu("Menu");
            menu.setMnemonic(KeyEvent.VK_G);
            add(menu);
            menuItem_New=new JMenuItem("New Game", KeyEvent.VK_N);
            menu.add(menuItem_New);
            menuItem_Help=new JMenuItem("Help", KeyEvent.VK_H);
            menu.add(menuItem_Help);
            menuItem_Quit=new JMenuItem("Quit",KeyEvent.VK_Q);
            menu.add(menuItem_Quit);
            menuItem_Help.addActionListener(handler);
            menuItem_New.addActionListener(handler);
            menuItem_Quit.addActionListener(handler);
        }
        private class MenuHandler implements ActionListener
 {
  public void actionPerformed(ActionEvent event)
  {
                    if(event.getSource()==menuItem_Help)
                        JOptionPane.showMessageDialog(null,"Help:\n" +
                                "The goal of this game is to find all the baffles by shooting lasers through the grid and guessing baffles accordingly.\n\n" +
                                "Fire: by changing numbers in the fire box you pick the starting location of a laser shot.\n" +
                                "\tThe exit location of the laser shot will then be displayed.\n\n" +
                                "Guess: by changing the guess boxes you decide the row, column, and direction of where you think a baffle is located.\n" +
                                "\tHit the guess button when satisfied with location.  The screen will output if you were correct or incorrect.\n" +
                                "If the guess was correct, the baffle will show up in it's location. If the guess was incorrect, the guessed location\n" +
                                "will turn red. After your guess, if the baffle does not show up and the box is not red... Think about the direction.\n\n"+
                                "Score: Hitting the score button tells you your score for the game.\n" +
                                "\t2 points for a guess and 1 point for a laser shot.\n" +
                                "\tThe object is to guess all the baffles with the lowest score!\n\n" +
                                "Good luck!!");    
                    else if(event.getSource()==menuItem_New)
                    {
                        baffle.findDifficulty();
                        //baffle.resetGame();
                    }
                    else
                    {
                        JOptionPane.showMessageDialog(null,"Thanks for playing!");
                            System.exit(1);
                    }
                }
        }
}

