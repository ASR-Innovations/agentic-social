'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

export type CalendarView = 'month' | 'week' | 'day';

export interface Post {
  id: string;
  content: string;
  platforms: string[];
  scheduledAt: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  mediaType?: 'image' | 'video' | 'carousel';
  aiGenerated?: boolean;
}

interface CalendarGridProps {
  view: CalendarView;
  currentDate: Date;
  posts: Post[];
  onDateChange: (date: Date) => void;
  onPostClick: (post: Post) => void;
  onPostDrop: (postId: string, newDate: Date) => void;
}

export function CalendarGrid({
  view,
  currentDate,
  posts,
  onDateChange,
  onPostClick,
  onPostDrop,
}: CalendarGridProps) {
  const handlePrevious = () => {
    if (view === 'month') {
      onDateChange(subMonths(currentDate, 1));
    } else if (view === 'week') {
      onDateChange(subWeeks(currentDate, 1));
    } else {
      onDateChange(subDays(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      onDateChange(addMonths(currentDate, 1));
    } else if (view === 'week') {
      onDateChange(addWeeks(currentDate, 1));
    } else {
      onDateChange(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getDaysToDisplay = () => {
    if (view === 'month') {
      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));
      return eachDayOfInterval({ start, end });
    } else if (view === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return eachDayOfInterval({ start, end });
    } else {
      return [currentDate];
    }
  };

  const getPostsForDate = (date: Date) => {
    return posts.filter(post => 
      isSameDay(new Date(post.scheduledAt), date)
    );
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const postId = result.draggableId;
    const destinationDate = new Date(result.destination.droppableId);
    
    onPostDrop(postId, destinationDate);
  };

  const days = getDaysToDisplay();

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">
            {view === 'month' && format(currentDate, 'MMMM yyyy')}
            {view === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`}
            {view === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h2>
          <Button variant="secondary" size="sm" onClick={handleToday}>
            <CalendarIcon className="w-4 h-4 mr-2" />
            Today
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm" onClick={handlePrevious}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {view === 'month' && (
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map(day => {
              const dayPosts = getPostsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <Droppable key={day.toISOString()} droppableId={day.toISOString()}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[120px] p-2 ${
                        !isCurrentMonth ? 'opacity-50' : ''
                      } ${
                        isToday ? 'ring-2 ring-blue-500' : ''
                      } ${
                        snapshot.isDraggingOver ? 'bg-blue-500/20' : 'glass-card'
                      }`}
                    >
                      <div className="text-sm font-medium text-white mb-2">
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayPosts.map((post, index) => (
                          <Draggable key={post.id} draggableId={post.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => onPostClick(post)}
                                className={`text-xs p-2 rounded cursor-pointer transition-all ${
                                  snapshot.isDragging ? 'opacity-50' : ''
                                } ${
                                  post.status === 'published' ? 'bg-green-500/20 text-green-300' :
                                  post.status === 'scheduled' ? 'bg-blue-500/20 text-blue-300' :
                                  post.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                                  'bg-gray-500/20 text-gray-300'
                                } hover:scale-105`}
                              >
                                <div className="truncate">{post.content.substring(0, 30)}...</div>
                                <div className="text-xs opacity-70 mt-1">
                                  {format(new Date(post.scheduledAt), 'h:mm a')}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </Card>
                  )}
                </Droppable>
              );
            })}
          </div>
        )}

        {view === 'week' && (
          <div className="grid grid-cols-7 gap-2">
            {days.map(day => {
              const dayPosts = getPostsForDate(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <Droppable key={day.toISOString()} droppableId={day.toISOString()}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[400px] p-3 ${
                        isToday ? 'ring-2 ring-blue-500' : ''
                      } ${
                        snapshot.isDraggingOver ? 'bg-blue-500/20' : 'glass-card'
                      }`}
                    >
                      <div className="text-center mb-3">
                        <div className="text-sm font-medium text-gray-400">
                          {format(day, 'EEE')}
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {format(day, 'd')}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {dayPosts.map((post, index) => (
                          <Draggable key={post.id} draggableId={post.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => onPostClick(post)}
                                className={`p-3 rounded cursor-pointer transition-all ${
                                  snapshot.isDragging ? 'opacity-50' : ''
                                } ${
                                  post.status === 'published' ? 'bg-green-500/20 text-green-300' :
                                  post.status === 'scheduled' ? 'bg-blue-500/20 text-blue-300' :
                                  post.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                                  'bg-gray-500/20 text-gray-300'
                                } hover:scale-105`}
                              >
                                <div className="text-sm font-medium mb-1">
                                  {format(new Date(post.scheduledAt), 'h:mm a')}
                                </div>
                                <div className="text-xs truncate">{post.content.substring(0, 50)}...</div>
                                <div className="flex items-center space-x-1 mt-2">
                                  {post.platforms.slice(0, 3).map(platform => (
                                    <div key={platform} className="w-4 h-4 rounded-full bg-white/20" />
                                  ))}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </Card>
                  )}
                </Droppable>
              );
            })}
          </div>
        )}

        {view === 'day' && (
          <Droppable droppableId={currentDate.toISOString()}>
            {(provided, snapshot) => (
              <Card
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`p-6 ${
                  snapshot.isDraggingOver ? 'bg-blue-500/20' : 'glass-card'
                }`}
              >
                <div className="space-y-3">
                  {getPostsForDate(currentDate).map((post, index) => (
                    <Draggable key={post.id} draggableId={post.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => onPostClick(post)}
                          className={`p-4 rounded-lg cursor-pointer transition-all ${
                            snapshot.isDragging ? 'opacity-50' : ''
                          } ${
                            post.status === 'published' ? 'bg-green-500/20' :
                            post.status === 'scheduled' ? 'bg-blue-500/20' :
                            post.status === 'failed' ? 'bg-red-500/20' :
                            'bg-gray-500/20'
                          } hover:scale-105`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-lg font-medium text-white">
                              {format(new Date(post.scheduledAt), 'h:mm a')}
                            </div>
                            <div className="flex items-center space-x-2">
                              {post.platforms.map(platform => (
                                <div key={platform} className="w-6 h-6 rounded-full bg-white/20" />
                              ))}
                            </div>
                          </div>
                          <div className="text-gray-300">{post.content}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </Card>
            )}
          </Droppable>
        )}
      </DragDropContext>
    </div>
  );
}
